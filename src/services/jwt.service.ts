import {decode, TAlgorithm, encode} from "jwt-simple";
import {DecodeResult, EncodeResult, ExpirationStatus, PartialSession, Session} from "../models/auth.model";
import {Service} from "typedi";
import {JWTDecodeFailedException} from "../exceptions/JWTDecodeFailed.exception";
import {NextFunction, Request, Response} from "express";

@Service()
export class JwtService {
    private readonly secretKey: string;
    protected algorithm: TAlgorithm = "HS512";
    protected expiresIn = parseInt(process.env.JWT_EXPIRY as string) || 15;//Minutes
    protected refreshTokenExpiresIn = parseInt(process.env.JWT_REFRESH_EXPIRY as string) || 60*24*30;//Minutes
    protected gracePeriodInHours = parseInt(process.env.JWT_EXPIRY_GRACE_PERIOD as string) || 3;//Hours

    constructor() {
        this.secretKey = process.env.JWT_SECRET_KEY as string;
    }

    encode(partialSession: PartialSession): EncodeResult {
        const issued = Date.now();
        const minuteExpiry = this.expiresIn * 60 * 1000;
        const expires = issued + minuteExpiry;

        const session: Session = {
            ...partialSession,
            issued: issued,
            expires: expires
        };

        const refreshTokenExpiresAt = issued + (this.refreshTokenExpiresIn * 60 * 1000);

        // create a refresh token
        const refreshSession: Session = {
            ...partialSession,
            issued: issued,
            expires: refreshTokenExpiresAt
        }

        return {
            token: encode(session, this.secretKey, this.algorithm),
            refreshToken: encode(refreshSession, this.secretKey, this.algorithm),
            issued: issued,
            expires: expires,
            refreshTokenExpiresAt
        };
    }

    decodeSession(sessionToken: string): DecodeResult {
        let result: Session;

        try {
            result = decode(sessionToken, this.secretKey, false, this.algorithm);
        } catch (e) {
            // These error strings can be found here:
            // https://github.com/hokaccha/node-jwt-simple/blob/c58bfe5e5bb049015fcd55be5fc1b2d5c652dbcd/lib/jwt.js
            if (e.message === "No token supplied" || e.message === "Not enough or too many segments") {
                console.log('Bad token', e.message, sessionToken)
                return {
                    type: "invalid-token"
                };
            }

            if (e.message === "Signature verification failed" || e.message === "Algorithm not supported") {
                return {
                    type: "integrity-error"
                };
            }

            // Handle json parse errors, thrown when the payload is nonsense
            if (e.message.indexOf("Unexpected token") === 0) {
                console.log('Junk token',sessionToken);
                return {
                    type: "invalid-token"
                };
            }

            throw new JWTDecodeFailedException(e);
        }

        return {
            type: "valid",
            session: result
        }
    }

    checkExpirationStatus(token: Session): ExpirationStatus {
        const now = Date.now();

        if (token.expires > now) return "active";

        // Find the timestamp for the end of the token's grace period
        const hoursInMinutes = this.gracePeriodInHours * 60 * 60 * 1000;
        const hoursAfterExpiration = token.expires + hoursInMinutes;

        if (hoursAfterExpiration > now) return "grace";

        return "expired";
    }

    getSecretKey() {
        return this.secretKey;
    }
}

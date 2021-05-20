import {Service} from "typedi";
import {Prisma, Redis} from "../index";
import {genSalt, hash, compare} from 'bcryptjs';
import {JwtService} from "./jwt.service";
import {LoginFailedException} from "../exceptions/loginFailed.exception";
import moment from "moment";
import {RedisService} from "./redis.service";
import {DecodeResult} from "../models/auth.model";

export enum AuthExceptionCodes {
    USER_NOT_FOUND = '100.userNotFound',
    INVALID_PASSWORD = '101.invalidPassword',
}

export type HashPassword = (
    password: string,
    rounds: number,
) => Promise<string>;

export interface PasswordHasher<T = string> {
    hashPassword(password: T): Promise<T>;
    comparePassword(providedPass: T, storedPass: T): Promise<boolean>;
}

export async function hashPassword(
    password: string,
    rounds: number,
): Promise<string> {
    const salt = await genSalt(rounds);
    return await hash(password, salt);
}

export class BcryptHasher implements PasswordHasher<string> {
    constructor(
        private readonly rounds: number
    ) {}

    async hashPassword(password: string): Promise<string> {
        const salt = await genSalt(this.rounds);
        return await hash(password, salt);
    }

    async comparePassword(
        providedPass: string,
        storedPass: string,
    ): Promise<boolean> {
        return  await compare(providedPass, storedPass);

    }

}

export function tokenGenerator (length: number = 10) {
    let text = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < length; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

interface IPartialUser {
    id: number;
    username: string;
    firstName?: string;
    lastName?: string;
}

@Service()
export class AuthService {

    public hasher: BcryptHasher;
    constructor() {
        this.hasher = new BcryptHasher(10);
    }

    async login(email: string, password: string) {
        const user = await Prisma.user.findFirst({
            where: {email: email},
        });

        if (!user) {
            throw new LoginFailedException(AuthExceptionCodes.USER_NOT_FOUND);
        }

        if (!await this.hasher.comparePassword(password, user.password)) {
            throw new LoginFailedException(AuthExceptionCodes.INVALID_PASSWORD);
        }

        return await this.generateSession({
            id: user.id,
            username: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
        });
    }

    async logout(token: string) {

    }

    async validateRefreshToken(token: string) {
        // decode the token
        const decodedToken: DecodeResult = (new JwtService()).decodeSession(token);

        if (decodedToken.type !== 'valid') {
            console.log('Invalid token type', decodedToken.type);
            return false;
        }

        const session = decodedToken.session;
        const exists = await (new RedisService()).exists(`refresh-token-${session.id}`);
        if (!exists) {
            console.log(`No Redis key refresh-token-${session.id}`);
            return false;
        }

        const storedToken = await (new RedisService()).get(`refresh-token-${session.id}`);

        if (storedToken !== token) {
            console.log(`Decoded token does not match the redis one`);
            return false;
        }

        return this.generateSession({
            id: session.id,
            username: session.username,
        });
    }

    async generateSession(user: IPartialUser) {
        const service = new JwtService();

        const result = service.encode({
            id: user.id,
            username: user.username,
            dateCreated: Date.now()
        });

        const expires = moment(result.expires).toDate();
        const issued = moment(result.issued).toDate();
        const ttl = moment.duration(moment(result.refreshTokenExpiresAt).diff(moment())).asMinutes();

        // save the refresh token on redis
        await (new RedisService()).put(`refresh-token-${user.id}`, result.refreshToken, Math.round(ttl));

        return {
            token: result.token,
            refreshToken: result.refreshToken,
            firstName: user.firstName,
            lastName: user.lastName,
            issued,
            expires,
        }
    }

    async revokeToken(token: string) {
        const decodedToken: DecodeResult = (new JwtService()).decodeSession(token);
        if (decodedToken.type !== 'valid') {
            return;
        }


        const session = decodedToken.session;

        return await (new RedisService()).del(`refresh-token-${session.id}`);
    }
}

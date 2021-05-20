import {ExpressMiddlewareInterface} from "routing-controllers";
import {NextFunction, Request, Response} from "express";
import {DecodeResult, ExpirationStatus, Session} from "../models/auth.model";
import {JwtService} from "../services/jwt.service";
import {Service} from "typedi";


@Service()
export class JwtMiddleware implements ExpressMiddlewareInterface {
    use(request: Request, response: Response, next: NextFunction): any {
        const service = new JwtService();
        const unauthorized = (message: string) => response.status(401).json({
            ok: false,
            status: 401,
            message: message
        });

        const requestHeader = "X-JWT-Token";
        const responseHeader = "X-Renewed-JWT-Token";
        const header = request.header(requestHeader);

        if (!header) {
            unauthorized(`Required ${requestHeader} header not found.`);
            return;
        }

        const decodedSession: DecodeResult = service.decodeSession(header);

        if (decodedSession.type === "integrity-error" || decodedSession.type === "invalid-token") {
            unauthorized(`Failed to decode or validate authorization token. Reason: ${decodedSession.type}.`);
            return;
        }

        const expiration: ExpirationStatus = service.checkExpirationStatus(decodedSession.session);

        if (expiration === "expired") {
            unauthorized(`Authorization token has expired. Please create a new authorization token.`);
            return;
        }

        let session: Session;

/*        if (expiration === "grace") {
            // Automatically renew the session and send it back with the response
            const {token, expires, issued} = service.encode(decodedSession.session);
            session = {
                ...decodedSession.session,
                expires: expires,
                issued: issued
            };

            response.setHeader(responseHeader, token);
        }
        else {
            session = decodedSession.session;
        }*/
        session = decodedSession.session;
        // Set the session on response.locals object for routes to access
        response.locals = {
            ...response.locals,
            session: session
        };

        // @ts-ignore
        request.session.user = session;

        // Request has a valid or renewed session. Call next to continue to the authenticated route handler
        next();
    }
}

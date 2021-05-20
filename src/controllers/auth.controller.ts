import {Service} from "typedi";
import {Body, JsonController, Post, Req, Res} from "routing-controllers";
import {IAuthLoginRequest} from "../models/auth.model";
import {AuthService} from "../services/auth.service";
import {Request, Response} from "express";
import {token} from "morgan";
import * as stream from "stream";


@Service()
@JsonController('/oauth')
export class AuthController {
    @Post('/token')
    async login(@Res() res: Response, @Body() body: IAuthLoginRequest) {

        const service = new AuthService();
        try {
            return await service.login(body.email, body.password)
        } catch (e) {
            return {success: false, reason: e.message};
        }
    }

    @Post('/refresh-token')
    async refresh(@Res() res: Response, @Req() req: Request, @Body() body: {token: string}) {
        const session = await (new AuthService()).validateRefreshToken(body.token);

        if (!session) {
            return {success: false, reason: 'Invalid Refresh Token'};
        }

        return session;
    }

    @Post('/revoke-token')
    async revoke(@Res() res: Response, @Req() req: Request, @Body() body: {token: string}) {
        await (new AuthService()).revokeToken(body.token);
        return {success: true}
    }
}

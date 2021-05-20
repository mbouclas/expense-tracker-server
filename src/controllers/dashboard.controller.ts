import {Get, JsonController, Req, Session, UseBefore} from "routing-controllers";
import {Service} from "typedi";
import {JwtMiddleware} from "../middleware/jwt.middleware";
import {ISession} from "../models/generic";


@Service()
@JsonController('/api/dashboard')
@UseBefore(JwtMiddleware)
export class DashboardController {
    @Get('/')
    async dashboard(@Session({required: false}) sess: ISession) {
        return {success: true}
    }
}

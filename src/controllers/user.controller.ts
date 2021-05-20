import {Service} from "typedi";
import {
    Delete,
    Get,
    JsonController,
    Param,
    Patch,
    Post,
    QueryParams,
    UseBefore,
    UseInterceptor
} from "routing-controllers";
import {IGenericObject} from "../models/generic";
import {JwtMiddleware} from "../middleware/jwt.middleware";
import {UserService} from "../services/user.service";
import {UserInterceptor} from "../interceptors/User.interceptor";

@Service()
@JsonController('/api/user')
@UseBefore(JwtMiddleware)
export class UserController {
    @Get('')
    async find(@QueryParams() filters: IGenericObject = {}) {

    }

    @Get('/:id')
    @UseInterceptor(UserInterceptor)
    async findOne(@Param('id') id: string, @QueryParams() params: IGenericObject = {}) {
        const service = new UserService();

        return await service.findOne({id: parseInt(id)});
    }

    @Post('')
    async store() {

    }

    @Patch('/:id')
    async update(@Param('id') id: number) {

    }

    @Delete('/:id')
    async delete(@Param('id') id: number) {

    }
}

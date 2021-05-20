import {Service} from "typedi";
import {Delete, Get, JsonController, Param, Patch, Post, QueryParams, UseBefore} from "routing-controllers";
import {IGenericObject} from "../models/generic";
import {JwtMiddleware} from "../middleware/jwt.middleware";

@Service()
@JsonController('/api/vendor')
@UseBefore(JwtMiddleware)
export class VendorController {
    @Get('')
    async find(@QueryParams() filters: IGenericObject = {}) {

    }

    @Get('/:id')
    async findOne(@Param('id') id: string, @QueryParams() params: IGenericObject = {}) {

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

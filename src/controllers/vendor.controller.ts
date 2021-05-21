import {Service} from "typedi";
import {
    Body,
    Delete,
    Get,
    JsonController,
    Param,
    Patch,
    Post,
    QueryParams,
    Req,
    Session,
    UseBefore
} from "routing-controllers";
import {IGenericObject, ISession} from "../models/generic";
import {JwtMiddleware} from "../middleware/jwt.middleware";
import {VendorService} from "../services/vendor.service";
import {Request} from "express";
import {ICreateExpenseTypeRequest} from "../services/expenseType.service";

@Service()
@JsonController('/api/vendor')
@UseBefore(JwtMiddleware)
export class VendorController {
    private service: VendorService;
    constructor() {
        this.service = new VendorService();
    }

    @Get('')
    async find(@Req() request: Request) {
        return await this.service.find(request.query || {}, request.query.with as string[] || []);
    }

    @Get('/:id')
    async findOne(@Param('id') id: string, @QueryParams() params: IGenericObject = {}) {
        return await this.service.findOne({id: parseInt(id)}, params.with || [])
    }

    @Post('')
    async store(@Body() body: ICreateExpenseTypeRequest, @Session() sess: ISession) {
        try {
            return await this.service.store(body);
        }
        catch (e) {
            console.log(e);
            return {success: false, reason: e.message};
        }
    }

    @Patch('/:id')
    async update(@Param('id') id: string, @Body() body: ICreateExpenseTypeRequest, @Session() sess: ISession) {
        try {
            return await this.service.update(parseInt(id), body);
        }
        catch (e) {
            console.log(e);
            return {success: false, reason: e.message};
        }
    }

    @Delete('/:id')
    async delete(@Param('id') id: string) {
        return await this.service.delete(parseInt(id));
    }
}

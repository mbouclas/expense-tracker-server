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
import {JwtMiddleware} from "../middleware/jwt.middleware";
import {Request} from "express";
import {IGenericObject, ISession} from "../models/generic";
import {ExpenseTypeService, ICreateExpenseTypeRequest} from "../services/expenseType.service";




@Service()
@JsonController('/api/expense-type')
@UseBefore(JwtMiddleware)
export class ExpenseTypeController {
    private service: ExpenseTypeService;
    constructor() {
        this.service = new ExpenseTypeService();
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

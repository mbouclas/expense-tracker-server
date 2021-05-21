import {Service} from "typedi";
import {
    Body,
    Delete,
    Get,
    JsonController,
    Param,
    Patch,
    Post,
    QueryParams, Req,
    Session,
    UseBefore, UseInterceptor
} from "routing-controllers";
import {IGenericObject, ISession} from "../models/generic";
import {JwtMiddleware} from "../middleware/jwt.middleware";
import {ExpensesService, ICreateExpenseRequest} from "../services/expenses.service";
import {ExpenseInterceptor} from "../interceptors/Expense.interceptor";
import {Request} from "express";
import {AttachmentsService} from "../services/attachments.service";
import {ExpenseListInterceptor} from "../interceptors/ExpenseList.interceptor";



@Service()
@JsonController('/api/expense')
@UseBefore(JwtMiddleware)
export class ExpenseController {
    private service: ExpensesService;
    constructor() {
        this.service = new ExpensesService();
    }

    @Get('/group-by-vendor')
    async groupByVendor(@Req() request: Request) {
        return await this.service.groupByVendor(request.query || {});
    }


    @Get('/group-by-type')
    async groupByType(@Req() request: Request) {
        return await this.service.groupByExpenseType(request.query || {});
    }

    /**
     * /api/expense?created_at%5Bmin%5D=2021-04-28T08%3A25%3A06.079Z&price%5Bmax%5D=1001&title=cab&page=1&limit=10
     * @param request
     */
    @Get('')
    @UseInterceptor(ExpenseListInterceptor)
    async find(@Req() request: Request) {
        return await this.service.find(request.query || {}, request.query.with as string[] || []);
    }

    /**
     * /api/expense/4?with[]=expenseType&with[]=vendor&with[]=user&with[]=attachments
     * @param id
     * @param params
     */
    @Get('/:id')
    @UseInterceptor(ExpenseInterceptor)
    async findOne(@Param('id') id: string, @QueryParams() params: IGenericObject = {}) {

        return await this.service.findOne({id: parseInt(id)}, params.with || []);
    }

    @Post('')
    async store(@Body() body: ICreateExpenseRequest, @Session() sess: ISession) {
        if (!body.userId) {
            body.userId = sess.user.id;
        }

        try {
            return await this.service.store(body);
        }
        catch (e) {
            console.log(e);
            return {success: false, reason: e.message};
        }
    }

    @Patch('/:id')
    async update(@Param('id') id: string, @Body() body: ICreateExpenseRequest, @Session() sess: ISession) {
        if (!body.userId) {
            body.userId = sess.user.id;
        }

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

    @Post('/:id/attachment')
    async addAttachment(@Param('id') id: string) {
        const attachmentService = new AttachmentsService();

    }


}

import {Service} from "typedi";
import {Body, Get, JsonController, Param, Post, Req, UseBefore} from "routing-controllers";
import {JwtMiddleware} from "../middleware/jwt.middleware";
import {Request} from "express";
import {ExpensesService} from "../services/expenses.service";
import {ExportService} from "../services/export.service";

@Service()
@UseBefore(JwtMiddleware)
@JsonController('/api/export')
export class ExportsController {
    protected exportService: ExportService;
    constructor() {
        this.exportService = new ExportService();
    }

    @Get('/:id')
    async export(@Param('id') id: string) {
        return await this.exportService
            .addItem(parseInt(id))
            .toExcel();
    }

    @Post('')
    async exportMany(@Req() request: Request, @Body() ids: string[]) {
        return await this.exportService
            .fromQueryParams({id: ids.map(id => parseInt(id))})
            .toExcel();
    }

}

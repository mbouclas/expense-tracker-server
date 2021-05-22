import {Get, JsonController, Req, UseBefore} from "routing-controllers";
import {JwtMiddleware} from "../middleware/jwt.middleware";
import {ExpenseTypeService} from "../services/expenseType.service";
import {Request} from "express";
import {Service} from "typedi";
import {VendorService} from "../services/vendor.service";

@Service()
@JsonController('/api/boot')
@UseBefore(JwtMiddleware)
export class BootClientController {
    @Get('')
    async boot(@Req() request: Request) {
        const expenseTypes = await (new ExpenseTypeService()).all({orderBy: 'title', way: 'asc'});
        const vendors = await (new VendorService()).all({orderBy: 'title', way: 'asc'});
        return {
            expenseTypes,
            vendors,
        };
    }
}

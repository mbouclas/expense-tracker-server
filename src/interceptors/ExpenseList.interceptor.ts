import {Action, InterceptorInterface} from "routing-controllers";
import {IExpense} from "../services/expenses.service";
import {IPagination} from "../models/generic";
import {moneyFromDbFormat} from "../helpers/price";
import {Service} from "typedi";
import {UserInterceptor} from "./User.interceptor";
import {ExpenseInterceptor} from "./Expense.interceptor";

@Service()
export class ExpenseListInterceptor implements InterceptorInterface {
    async intercept(action: Action, content: IPagination<IExpense>) {
        if (content.data.length === 0) {return content;}

        content.data.forEach(item => {

            if (item.user) {
                UserInterceptor.sanitize(item.user);
            }

            ExpenseInterceptor.sanitize(item);
        });

        return content;
    }
}

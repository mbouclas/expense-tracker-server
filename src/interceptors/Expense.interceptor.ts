import {Action, InterceptorInterface} from "routing-controllers";
import {Service} from "typedi";
import {removeDates} from "./helpers";
import {IExpense} from "../services/expenses.service";
import {UserInterceptor} from "./User.interceptor";
import {moneyFromDbFormat} from "../helpers/price";



@Service()
export class ExpenseInterceptor implements InterceptorInterface {
    async intercept(action: Action, content: IExpense) {
        removeDates(content);

        ExpenseInterceptor.sanitize(content);


        return content
    }

    public static sanitize(content: IExpense) {
        if (content.user) {
            UserInterceptor.sanitize(content.user);
        }

        if (content.price) {
            content.price = moneyFromDbFormat(content.price);
        }

        // @ts-ignore
        delete content.userId;
    }
}

import {Action, InterceptorInterface} from "routing-controllers";
import {IUser} from "../services/user.service";
import {removeDates} from "./helpers";
import {Service} from "typedi";

@Service()
export class UserInterceptor implements InterceptorInterface {
    async intercept(action: Action, content: IUser) {
        UserInterceptor.sanitize(content);
        return content;
    }

    public static sanitize(content: IUser) {
        removeDates(content);
        // @ts-ignore
        delete content.password;
    }
}

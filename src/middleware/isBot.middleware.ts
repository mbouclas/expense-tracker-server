import {ExpressMiddlewareInterface} from "routing-controllers";
import {NextFunction, Request, Response} from "express";
import isbot from "isbot";
import {Service} from "typedi";
import path from "path";

@Service()
export class IsBotMiddleware implements ExpressMiddlewareInterface {
    use(req: Request, res: Response, next: NextFunction): any {
        // render an index.html page?
        if (!isbot(req.get('user-agent') as string)) {
            return res.sendFile(path.join(__dirname, '../public'));
        }

        next();
    }
}

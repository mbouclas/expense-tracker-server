import {NextFunction, Request, Response} from "express";


import {ExpressMiddlewareInterface} from "routing-controllers";


export class AllowedIpsMiddleware implements ExpressMiddlewareInterface { // interface implementation is optional

    use(req: Request, res: Response, next: NextFunction): any {
        if (process.env.NODE_ENV === 'development' || process.env.APPLY_AUTH_MIDDLEWARE === 'false') {return next();}
        if (!process.env.ALLOWED_HOSTS) {
            return res.status(403).send('No allowed hosts in the list');
        }

        const origin = req.header('origin');

        if (!origin) {return res.status(403).send('E502_INVALID_CLIENT');}

        const allowed = process.env.ALLOWED_HOSTS.split(',');
        // check out the headers for a valid client
        let found = false;

        allowed.forEach(host => {
            if (host === origin) {found = true}
        })

        if (!found) {
            {return res.status(403).send('E502_INVALID_CLIENT');}
        }

        next();
    }

}

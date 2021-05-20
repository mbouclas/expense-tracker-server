import {merge} from 'lodash';
import {IGenericObject} from "../models/general";
import {NextFunction, Request, Response} from "express";
import {getMetadataArgsStorage} from "routing-controllers";
import {createFilterUrl} from "./serializers";

export class NamedRoutes {
    public static absolute = true;
    public static names: IGenericObject = {};


    static get(name: string) {
        return this.names[name] || '';
    }

    static setOne(name: string, path: string | RegExp) {
        if (typeof path === 'string' && path.indexOf('/') === 0) {
            path = path.substring(1).replace(/\/$/, "");
        }

        this.names[name] = path;

        return this;
    }

    static set(names: IGenericObject, base: string) {
        if (base){
            for (var a in names){
                names[a] = base + names[a];
            }
        }

        this.names = merge(names, this.names);
        return this;
    }

    static url(name: string, params: IGenericObject = {}, queryParams: IGenericObject = {}) {
        if (typeof this.names[name] == 'undefined'){
            return '';
        }

        const prefix = (this.absolute) ? '/' : '';

        if (Object.keys(params).length > 0){
            let temp = this.names[name];
            for (var a in params){
                temp = temp.replace(':'+ a,params[a]);
            }
            return createFilterUrl((prefix + temp).replace(`//`, '/'), queryParams);
        }


        return createFilterUrl((prefix + this.names[name]).replace(`//`, '/'), queryParams);
    }

    static use(res: any, req: any, next: any) {
        res.locals.Route = NamedRoutes;
        next();
    }
}

export const NamedRoute = (name: string) => (
    target: Object,
    propertyKey: string,
    descriptor: PropertyDescriptor
) => {
    // const originalMethod = descriptor.value;
    setTimeout(() => {
        const routes = getMetadataArgsStorage().actions
            .filter(item => {
                return item.method === propertyKey && target.constructor === item.target
            });

        const controller = getMetadataArgsStorage().controllers.filter(item => target.constructor === item.target)[0];

        NamedRoutes.setOne(name, `${controller.route}${routes[0].route}`);
    }, 50);

}


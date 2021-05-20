import {SessionData} from "express-session";
import {Session} from "./auth.model";

export interface IGate {
    uuid?: string;
    gate: string;
    level: number;
    name: string;
    description?: string;
    provider: string;
}

export interface IBaseNamedModel {
    uuid: string;
    name: string;
}

export interface ILanguage extends IBaseNamedModel{
    code: string;
}

export interface IGenericObject<T = any> {
    [key: string]: T;
}

export interface ISession extends SessionData {
    user: Session
}

export interface BaseModel {

}

export interface IFacet extends BaseModel{
    count: number;
    label: string;
}

export interface IPagination<T = any> {
    total:number;
    limit:number; // num of items to display
    skip?: number; // offset
    page?: number;
    pages?: number;
    facets?: IGenericObject<IFacet[]>
    data: T[];
    totalPrice?: number;
}

export class FindManyFilters implements IFindManyFilters {
    limit = 10;
    page = 1;
    skip = 0;
    way = 'ASC';
    orderBy = 'id';

    constructor(values: IFindManyFilters = {} as IFindManyFilters) {
        if (Object.keys(values).length === 0) {return;}

        for (let key in values) {
            // @ts-ignore
            this[key] = values[key];
        }
    }
}

export interface IFindManyFilters {
    limit?: number;
    page?: number;
    skip?: number;
    orderBy?: string;
    way?: string;
    [key: string]: any;
}

import * as colors from 'colors'
import {IGenericObject} from "../models/generic";

export class BaseCliCommand {
    command = '';
    description = '';
    options: IGenericObject = {};
    colors = colors;
    async fire(args?: any): Promise<any>{}


}


export function delay(t: number, val: any) {
    return new Promise(function (resolve) {
        setTimeout(function () {
            resolve(val);
        }, t);
    });
}

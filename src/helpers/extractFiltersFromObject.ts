import {IGenericObject} from "../models/generic";

export function extractSingleFilterFromObject(filter: IGenericObject) {
    const key = Object.keys(filter)[0];
    const value = filter[key];

    return {key, value};
}

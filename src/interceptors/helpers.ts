import {IGenericObject} from "../models/generic";

export function removeDates(obj: IGenericObject) {
    if (obj.created_at) {delete obj.created_at;}
    if (obj.updated_at) {delete obj.updated_at;}
}

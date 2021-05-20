import {IGenericObject} from "../models/generic";

export function serializeQuery(obj: any): string {
    const params = [];
    for (let key in obj) {
        params.push(`${key}:${obj[key]}`);
    }

    return params.join(',');
}

export function unserializeQuery(str: string): object {
    const arr = str.split(',');
    const obj: any = {};
    arr.forEach(item => {
        const parts = item.split(':');
        obj[parts[0]] = parts[1];
    });

    return obj;
}

export function createFilterUrl(url: string, filters: IGenericObject = {}) {
    const params = Object.entries(filters);

    const paramsString = [];
    for (let i in params) {
        if (typeof params[i][1] === 'object' && !Array.isArray(params[i][1])) {
            for (let j in params[i][1]) {
                paramsString.push(`${params[i][0]}=${j}:::${params[i][1][j]}`);
            }
            continue;
        }
        else if (Array.isArray(params[i][1])) {
            params[i][1].forEach((value: any) => paramsString.push(`${params[i][0]}[]=${value}`));
            continue;
        }

        paramsString.push(`${params[i][0]}=${params[i][1]}`);
    }

    if (paramsString.length > 0) {
        url += `?${paramsString.join('&')}`
    }

    return url;
}

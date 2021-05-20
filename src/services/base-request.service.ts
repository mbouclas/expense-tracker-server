import { Service } from "typedi";
import {AxiosRequestFailedException} from "../exceptions/AxiosRequestFailed.exception";
import {createFilterUrl} from "../helpers/serializers";
import {AxiosResponse} from "axios";
import {AppState, Axios} from "../index";
import {IGenericObject} from "../models/generic";


@Service('BaseRequestService')
export class BaseRequestService {
    async post<T>(url: string, data: IGenericObject) {
        let res: AxiosResponse<T>;
        try {
            res = await Axios.post<T>(`${process.env.API_URL}${url}`, data, {
                withCredentials: true,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    // Authorization: `Bearer ${UserAuth.accessToken}`,
                    // Cookie: UserAuth.cookie,
                }
            });
        }
        catch (e) {
            throw new AxiosRequestFailedException(e);
        }

        return res.data;
    }

    async get<T>(url: string, queryParams: IGenericObject = {}, lang?: string) {
        let res: AxiosResponse<T>;
        lang = (lang) ? lang : 'en';
        const endpoint = `${process.env.API_URL}${url}`;
        const q = (Object.keys(queryParams).length > 0) ? createFilterUrl(endpoint, queryParams) : endpoint;

        try {
            res = await Axios.get<T>(q, {
                withCredentials: true,

                headers: {
                    'Access-Control-Allow-Origin': '*',
                    // Authorization: `Bearer ${UserAuth.accessToken}`,
                    // Cookie: UserAuth.cookie,
                    'X-CLIENT-ID': process.env.CLIENT_ID,
                    'X-LANG': lang,
                    'origin': `${process.env.HOST}:${process.env.PORT}`
                }
            });
        }
        catch (e) {
            console.log( q, e.message, e);
            throw new AxiosRequestFailedException(e);
        }

        return res.data;
    }
}

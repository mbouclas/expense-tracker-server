import {AxiosError, AxiosRequestConfig} from "axios";
import {Axios, boot} from "../index";


export class AxiosInterceptors {
    constructor() {
        this.registerAuthInterceptor();
    }

    private registerAuthInterceptor() {
        Axios.interceptors.response.use((response: any) => {
            // Any status code that lie within the range of 2xx cause this function to trigger
            // Do something with response data
            return response;
        }, async (error: AxiosError) => {
            // logged out for some reason
            if (error.response && error.response.status === 401) {
                await boot(true);
                if (error && error.config) {
                    const config: AxiosRequestConfig = error.config;
                    return new Promise(resolve => {
                        resolve(Axios(config));
                    });
                }
            }

            // Any status codes that falls outside the range of 2xx cause this function to trigger
            // Do something with response error
            return Promise.reject(error);
        });
    }
}



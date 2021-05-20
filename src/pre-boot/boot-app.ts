import {BaseRequestService} from "../services/base-request.service";
import {AppStateModel} from "../models/appState.model";
import {IGate, ILanguage} from "../models/generic";



export async function bootApp() {
    const languages = [
        {
            uuid: '',
            name: 'English',
            code: 'en'
        }
    ];

    return {
        finishedBooting: true,
        gates: [],
        languages,
        defaultLanguage: languages[0],
        defaultLanguageCode: languages[0].code
    };
/*    try {
        return  await (new BaseRequestService()).get<AppStateModel>('admin/boot');
    }
    catch (e) {
        throw new AxiosRequestFailedException(e);
    }*/
}

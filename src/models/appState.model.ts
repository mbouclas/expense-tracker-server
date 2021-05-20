import {IGate, ILanguage} from "./generic";

export interface AppStateModel {
    finishedBooting: boolean;
    gates: IGate[];
    languages: ILanguage[];
    defaultLanguage: ILanguage;
    defaultLanguageCode: string;
}




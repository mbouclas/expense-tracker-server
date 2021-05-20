import {Service} from "typedi";
import {basename, dirname} from 'path';
import {ObjectStorageService} from "./object-storage/ObjectStorage.service";

@Service()
export class ImageService {
    async store(name: string,) {
        const filename = basename(name);
        // Check if the file is in object storage. If yes, don't use a filepath
        const objectStorage = new ObjectStorageService();
        const existsInObjectStorage = await objectStorage.statObject(process.env.CLIENT_NAME as string, filename);
        const filePath = existsInObjectStorage ? 'objectStorage' : dirname(name);
    }
}

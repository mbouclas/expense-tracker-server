import {Service} from "typedi";
import {promisify} from "util";
import {basename, join} from 'path';
import {FailedUploadException} from "../exceptions/FailedUploadException";
import {fromFile} from 'file-type';
import {v4 as uuidv4} from 'uuid';
import * as path from "path";
import {IGenericObject} from "../models/generic";
import {ObjectStorageService} from "./object-storage/ObjectStorage.service";
import {ObjectStorageErrorException} from "./object-storage/exceptions/ObjectStorageError.exception";
import {ImageHandlerService} from "./image-handler.service";
import {makePreviewFileName} from "../helpers/image";
const writeFile = promisify(require('fs').writeFile);

export interface IBase64ImageRequest {
    base64String: string
    name: string;
    type: string;
    itemId?: string;
    imageType?: string;
}

@Service({id: 'UploadService'})
export class UploadsService {
    public bucketName = process.env.OBJECT_STORAGE_DEFAULT_BUCKET as string;
    async base64(file: IBase64ImageRequest): Promise<string> {
        const ext = path.extname(file.name);
        const uploadPath = '../../uploads';
        let uploadDir = join(__dirname, uploadPath, `${uuidv4()}${ext}`);
        const base64Image = file.base64String.split(';base64,').pop();
        try {
           await writeFile(uploadDir, base64Image, {encoding: 'base64'});
        }
        catch (e) {
           throw new FailedUploadException(e);
        }

        // create preview
        const previewFilename = makePreviewFileName(uploadDir);
        await ImageHandlerService.createThumbnail(uploadDir, previewFilename);

        // pass the file to object storage
        if (typeof process.env.OBJECT_STORAGE_DRIVER !== 'undefined') {
            await this.uploadToObjectStorage(uploadDir, {originalFileName: file.name, originalLocation: uploadDir});
            await this.uploadToObjectStorage(previewFilename);
        }



        return uploadDir;
    }


    async uploadTextFileFromString(filename: string, contents: string): Promise<string> {
        const uploadDir = join(__dirname, '../../../../uploads', filename);

        try {
            await writeFile(uploadDir, contents, {encoding: 'utf8'});
        }
        catch (e) {
            throw new FailedUploadException(e);
        }

        return uploadDir;
    }

    async figureOutFileType(file: string) {
        const type = await fromFile(file);

        if (type?.mime.indexOf('image') !== -1) {return {...type, ...{type: 'image'}};}
        if (type?.mime.indexOf('text') !== -1) {return {...type, ...{type: 'text'}};}
        if (type?.mime.indexOf('application') !== -1) {return {...type, ...{type: 'application'}};}
    }

    async uploadToObjectStorage(file: string, meta: IGenericObject = {}) {
        const objectStorage = new ObjectStorageService();

        try {
            await objectStorage.bucketExistsOrCreate(this.bucketName);
        }
        catch (e) {
            return false;
        }

        try {
            await objectStorage.createObject(this.bucketName, file, meta);
        }
        catch (e) {
            return false;
        }

        return true;
    }

    async delete(fileName: string) {
        const objectStorage = new ObjectStorageService();

        try {
            await objectStorage.deleteObject(this.bucketName, fileName);
        }
        catch (e) {
            throw new ObjectStorageErrorException(e);
        }

        return true;

    }

    async postUploadHandler(file: Express.Multer.File) {
        if (file.mimetype.indexOf('image') === -1) {
            return;
        }

        // create preview
        const previewFilename = makePreviewFileName(file.path);
        await ImageHandlerService.createThumbnail(file.path, previewFilename);

        await this.uploadToObjectStorage(previewFilename);

        return {previewFilename: basename(previewFilename)};
    }

    async getObjectUrl(previewFilename: string | undefined) {
        if (!previewFilename) {return undefined;}
        return await (new ObjectStorageService()).getObjectUrl(this.bucketName, previewFilename);
    }
}

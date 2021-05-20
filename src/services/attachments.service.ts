import {BaseDbService} from "./base-db.service";
import {IFindManyFilters, IGenericObject, IPagination} from "../models/generic";
import {Attachment} from "@prisma/client";
import {extractSingleFilterFromObject} from "../helpers/extractFiltersFromObject";
import {UploadsService} from "./uploads.service";
import {ObjectStorageService} from "./object-storage/ObjectStorage.service";
import {basename} from 'path';
import {file} from "find";
import {makePreviewFileName} from "../helpers/image";

export class AttachmentsService extends BaseDbService {
    public bucketName = process.env.OBJECT_STORAGE_DEFAULT_BUCKET as string;
    async store(attachment: Attachment) {
        const exists = await this.findOne({url: attachment.url});

        if (exists) {return exists;}

        const data = {
            url: attachment.url,
            user: {connect: {id: attachment.userId}},
            expense: {connect: {id: attachment.expenseId}},
            attachment_type: attachment.attachment_type,
        }

        return this.db.attachment.create({data});
    }

    async storeMany(expenseId: number, userId: number, attachments: Attachment[]) {
        return await Promise.all(attachments.map(attachment => {
            // @ts-ignore
            delete attachment.preview;

            return this.store({...{userId, expenseId}, ...attachment});
        }));
    }

    async update() {

    }


    async find(params: IFindManyFilters): Promise<IPagination<Attachment>> {
        return await this.db.attachment.findMany();
    }

    async findOne(filter: IGenericObject, relationships: string[] = []): Promise<Attachment> {
        const {key, value} = extractSingleFilterFromObject(filter);
        return await this.db.attachment.findFirst({
            where: filter
        });
    }

    async delete(id: number) {
        // get the item first cause we need to delete the file from the object storage
        const item = await this.findOne({id});
        // delete the object
        try {
            await (new UploadsService()).delete(item.url);
        }
        catch (e) {
            console.log('Could not delete file', e);
        }

        await this.db.attachment.delete({
            where: {id}
        });

        return true;
    }

    async getImageFromStorage(a: Attachment) {
        const objectStorage = new ObjectStorageService();

        return await objectStorage.getObjectUrl(this.bucketName, a.url );
    }

    async downloadFileById(id: number) {
        const attachment = await this.findOne({id});
        return await this.downloadFileByUrl(attachment.url);
    }

    async downloadFileByUrl(file: string) {
       return await (new ObjectStorageService()).getObjectUrl(this.bucketName, file);
    }

    async getPreviewImageFromStorage(a: Attachment) {
        if (a.attachment_type.indexOf('image') === -1) {
            return undefined;
        }

        const objectStorage = new ObjectStorageService();
        try {
            return await objectStorage.getObjectUrl(this.bucketName, makePreviewFileName( a.url) );
        }
        catch (e) {
            return '';
        }
    }


}

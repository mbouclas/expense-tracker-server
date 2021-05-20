import {Service} from "typedi";
import {Delete, Get, JsonController, Param, Patch, Post, QueryParams, UseBefore} from "routing-controllers";
import {IGenericObject} from "../models/generic";
import {JwtMiddleware} from "../middleware/jwt.middleware";
import {AttachmentsService} from "../services/attachments.service";
import {ObjectStorageService} from "../services/object-storage/ObjectStorage.service";

@Service()
@JsonController('/api/attachment')
@UseBefore(JwtMiddleware)
export class AttachmentController {
    @Get('')
    async find(@QueryParams() filters: IGenericObject = {}) {

    }

    @Get('/:id')
    async findOne(@Param('id') id: string, @QueryParams() params: IGenericObject = {}) {

    }

    @Post('')
    async store() {

    }

    @Patch('/:id')
    async update(@Param('id') id: string) {

    }

    @Delete('/:id')
    async delete(@Param('id') id: string) {
        const service = new AttachmentsService();
        await service.delete(parseInt(id));
        return {success: true};
    }

    @Get('/download/:id')
    async downloadFile(@Param('id') id: string) {
        return await (new AttachmentsService()).downloadFileById(parseInt(id));
    }
}

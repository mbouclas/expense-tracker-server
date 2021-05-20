import {Service} from "typedi";
import {Body, Delete, JsonController, Param, Post, Req, UseBefore} from "routing-controllers";
import {JwtMiddleware} from "../middleware/jwt.middleware";
import {IBase64ImageRequest, UploadsService} from "../services/uploads.service";
import {v4 as uuidv4} from "uuid";
import {unlinkSync} from 'fs';
import {basename, join, resolve} from 'path';
import {AttachmentsService} from "../services/attachments.service";
import {Request} from "express";


const multer = require('multer');
const storage = multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb: Function) => {
        cb(null, resolve('./', 'uploads'));
    },
    filename: (req: Request, file: Express.Multer.File, cb: Function) => {
        cb(null, file.originalname);
    }
});
const upload = multer({
    storage,
});

@Service()
@JsonController('/api/uploads')
@UseBefore(JwtMiddleware)
export class UploadsController {
    constructor(

    ) {
    }

    @Post('/file')
    @UseBefore(upload.any())
    async uploadFile(@Req() req: Request,) {
        const service = new UploadsService();
        // pass the uploaded files to the service for handling
        const files: Express.Multer.File[] = req.files as Express.Multer.File[];
        const uploadedFiles: {fileName: string, fileType: string, preview?: any}[] = [];
        for (let idx = 0; req.files.length > idx; idx++) {
            await service.uploadToObjectStorage(files[idx].path);
            const postOp = await service.postUploadHandler(files[idx]);
            console.log(postOp)
            const preview = (files[idx].mimetype.indexOf('image') !== -1) ? await service.getObjectUrl(postOp?.previewFilename) : undefined;
            uploadedFiles.push({fileName: files[idx].filename, fileType: files[idx].mimetype, preview});
            unlinkSync(files[idx].path);
        }

        return {uploadedFiles};
    }

    @Post('/base64')
    async image64(@Body() body: IBase64ImageRequest) {
        const service = new UploadsService();
        if (!body.name) {
            body.name = `${uuidv4()}.jpg`;
        }

        let uploadedFile;
        try {
            uploadedFile = await service.base64(body);
        }
        catch (e) {
            console.log(e)
            return {success: false, file: body.name, reason: e.message};
        }

        const fileType = await service.figureOutFileType(uploadedFile);
        unlinkSync(uploadedFile);
        return {fileName: basename(uploadedFile), fileType}
    }

    @Delete('/:id')
    async delete(@Param('id') id: string) {
        const service = new AttachmentsService();
        await service.delete(parseInt(id));
        return {success: true};
    }
}

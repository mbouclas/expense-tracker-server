const sharp = require('sharp');
export class ImageHandlerService {
    static async createThumbnail(file: string, destFile: string, width = 200, height = 200) {
        return await sharp(file)
            .resize(width, height)
            .jpeg({ mozjpeg: true })
            .toFile(destFile);
    }
}

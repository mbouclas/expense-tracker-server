import {IReadDirectoryFilesResult, readDirFiles} from "../helpers/readDirFiles";
import logger from "../shared/Logger";


export class EventLoaderService {
    async loadFromDir(dir: string) {
        const eventFiles = await readDirFiles(dir, ['.js', '.json', '.ts']);
        eventFiles.forEach((file: IReadDirectoryFilesResult) => {
            try {
                require(file.fullFileName)();
            }
            catch (e) {
                logger.err(e);
            }
        });

        return this;
    }
}

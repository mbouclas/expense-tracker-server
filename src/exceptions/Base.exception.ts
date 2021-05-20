export abstract class BaseException implements Error {

    constructor(public message: string) {
        // console.error(message);
    }

    name = '';
    getMessage() {return this.message;}
}

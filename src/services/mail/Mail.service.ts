import {MailgunDriver} from "./drivers/mailgun.driver";
import {DriverNotFoundException} from "../object-storage/exceptions/DriverNotFound.exception";

import {SmtpDriver} from "./drivers/smtp.driver";
import {MailSendingFailedException} from "../../exceptions/MailSendingFailed.exception";
export interface IBaseMailMessage {
    from: string;
    to: string;
    subject: string;
    text?: string;
    html?: string;
}

export interface IBaseMailServiceDriver {
    name: string;
    send(message: IBaseMailMessage): Promise<boolean>;
}

export class MailService {
    availableDrivers: {[key: string]: any} = {
        mailgun: MailgunDriver,
        smtp: SmtpDriver,
    }

    driver: IBaseMailServiceDriver;

    constructor(driver?: string) {
        if (!driver && !process.env.MAIL_DRIVER) {
            throw new DriverNotFoundException('No driver found');
        }

        const key = driver as string || process.env.MAIL_DRIVER as string;
        if (!this.availableDrivers[key]) {
            // check the availableDrivers list
            throw new DriverNotFoundException(`Driver ${key} is not listed`);
        }

        this.driver = new this.availableDrivers[key]();
    }

    async send(message: IBaseMailMessage) {

        try {
            await this.driver.send(message);
        }
        catch (e) {
            throw new MailSendingFailedException(e);
        }
    }
}

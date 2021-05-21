import {ExpensesService} from "./expenses.service";
import {Service} from "typedi";
import {Attachment, Expense, ExpenseType, User, Vendor} from "@prisma/client";
import {IFindManyFilters} from "../models/generic";
import {uniqBy} from 'lodash';
import {Workbook, Worksheet, stream} from 'exceljs'
import {moneyFromDbFormat} from "../helpers/price";
import {basename, resolve} from 'path';
import {existsSync, mkdirSync, createWriteStream, rmdirSync, unlinkSync} from "fs";
import {ObjectStorageService} from "./object-storage/ObjectStorage.service";
import moment from "moment";
import {ArchiverError} from "archiver";
import * as os from "os";
const archiver = require('archiver');


@Service()
export class ExportService {
    protected expensesService: ExpensesService;
    public itemsToProcess: number[] = [];
    public query: IFindManyFilters | undefined = undefined;
    public bucketName = process.env.OBJECT_STORAGE_DEFAULT_BUCKET as string;

    constructor() {
        this.expensesService = new ExpensesService();
    }

    addItem(id: number) {
        // const item = await this.expensesService.findOne({id}, ['attachments']);
        this.itemsToProcess.push(id);

        return this;
    }

    addItems(ids: number[]) {
        ids.forEach(id => this.addItem(id));

        return this;
    }

    fromQueryParams(query: IFindManyFilters) {
        this.query = query;
        return this;
    }

    async getItems() {
        return await this.expensesService.find({id: this.itemsToProcess}, ['attachments']);
    }

    async getItemsFromQuery() {
        if (!this.query) {
            return null;
        }

        return await this.expensesService.find(this.query, ['attachments']);
    }

    async process() {
        let items: Expense[] = [];
        let itemsFromIds: Expense[] = [];
        let itemsFromQuery: Expense[] = [];

        // check out the queue
        if (this.itemsToProcess.length > 0) {
            const tmp = await this.getItems();
            tmp.data.forEach(item => items.push(item));
        }

        // checkout the query
        if (this.query) {
            const tmp = await this.getItemsFromQuery();
            itemsFromQuery = (tmp) ? tmp.data : [];
            itemsFromQuery.forEach(item => items.push(item));
        }

        // merge

        return uniqBy(items, 'id');
    }

    async toExcel() {
        const items = await this.process();
        const book = new Workbook();
        let worksheet = book.addWorksheet('expenses');
        worksheet.columns = [
            {header: '#ID', key: 'id'},
            {header: 'Title', key: 'title'},
            {header: 'Price', key: 'price', numFmt: '"£"#,##0.00;[Red]\\-"£"#,##0.00'},
            {header: 'Date', key: 'purchased_at'},
            {header: '#Attachments', key: 'attachment_count'},
            {header: 'Attachment Location', key: 'attachment_file_name'},
        ];

        // Have to take this approach because ExcelJS doesn't have an autofit property.
        worksheet.columns.forEach(column => {
            if (!column || !column.header) {
                return;
            }
            column.width = column.header.length < 12 ? 12 : column.header.length
        })

        // Make the header bold.
        // Note: in Excel the rows are 1 based, meaning the first row is 1 instead of 0.
        worksheet.getRow(1).font = {bold: true}
        worksheet.getColumn(2).numFmt = '"EUR"#,##0.00;[Red]\\-"EUR"#,##0.00';
        worksheet.getColumn(3).numFmt = 'dd/mm/yy';

        items
            .map(item => {
            return {
                id: item.id,
                title: item.title,
                price: moneyFromDbFormat(item.price),
                purchased_at: item.purchased_at,
                // @ts-ignore
                attachment_count: Array.isArray(item.attachments) ? item.attachments.length: 0,
                attachment_file_name: `${item.id}_attachments`,
            }
        })
            .forEach((item, index) => {
                // row 1 is the header.
                const rowIndex = index + 2;

                worksheet.addRow({
                    ...item,
                    amountRemaining: {
                        formula: `=C${rowIndex}-D${rowIndex}`
                    },
                    percentRemaining: {
                        formula: `=E${rowIndex}/C${rowIndex}`
                    }
                });

            });

        const date = moment().format('DD-MM-YYYY');
        const exportDir = resolve('./', 'uploads', date);
        if (!existsSync(exportDir)) {
            mkdirSync(exportDir);
        }

        const outputFile = resolve('./', `${exportDir}/expenses-${date}.xlsx`);

        await book.xlsx.writeFile(outputFile);

        // now get the attachments
        await this.downloadAttachments(items, exportDir);

        // now zip everything
        const zipFileName = await this.zip(exportDir);
        rmdirSync(exportDir, {recursive: true});

        const oss = new ObjectStorageService();
        const exportFileName = basename(zipFileName);
        await oss.createObject(this.bucketName, zipFileName, {});
        unlinkSync(zipFileName);

        return {
            zipFileName: await oss.getObjectUrl(this.bucketName, exportFileName),
        };
    }

    async downloadAttachments(items: Expense[], outputDir: string) {
        for (let i = 0; items.length > i; i++) {
            let attachments: Attachment[] = [];
            // @ts-ignore
            attachments = items[i].attachments;
            const downloadDir = resolve(outputDir, `${items[i].id}_attachments`);
            if (!existsSync(downloadDir)) {
                mkdirSync(downloadDir);
            }

            for (let idx = 0; attachments.length > idx; idx++) {
                await this.downloadAttachment(attachments[idx], downloadDir);
            }

        }
    }

    async downloadAttachment(attachment: Attachment, outputDir: string) {
        try {
            await (new ObjectStorageService()).downloadObject(this.bucketName, attachment.url, `${outputDir}/${attachment.url}`);
        }
        catch (e) {
            console.log('Download error', e)
        }
    }

    async zip(dir: string): Promise<string> {
        const zipFileName = resolve('./',`uploads/${moment().format('DD-MM-YYYY')}.zip`);

        return new Promise(async (resolve, reject) =>  {

            const output = createWriteStream(zipFileName);
            const archive = archiver('zip');

            output.on('close', function () {
                console.log(archive.pointer() + ' total bytes');
                console.log('archiver has been finalized and the output file descriptor has closed.');
                resolve(zipFileName);
            });

            archive.on('error', (err: ArchiverError) => {
                reject(err);
            });

            archive.pipe(output);

            archive.directory(dir, false);

            await archive.finalize();
        });

    }
}

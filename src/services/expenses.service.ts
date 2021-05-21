import {BaseDbService} from "./base-db.service";
import {FindManyFilters, IFindManyFilters, IGenericObject, IPagination} from "../models/generic";
import {Attachment, Expense, ExpenseType, User, Vendor} from "@prisma/client";
import {IFilteredField, SetupPrismaQuery} from "../models/prisma.model";
import {moneyToDbFormat} from "../helpers/price";
import {AttachmentsService} from "./attachments.service";
import {Service} from "typedi";
export interface IExpense extends Expense {
    attachments?: Attachment[];
    user?: User;
    expenseType?: ExpenseType[];
    vendor?: Vendor;
}

export interface ICreateExpenseRequest {
    title: string;
    price: number;
    expenseTypes: ExpenseType[];
    vendorId?: number;
    vendor?: IGenericObject;
    userId?: number;
    user?: IGenericObject;
    attachments?: Attachment[];
}

@Service()
export class ExpensesService extends BaseDbService {
    filteredFields: IFilteredField[] = [
        {
            field: 'id',
            operator: 'equals',
            filterType: 'simple',
        },
        {
            field: 'expense_type',
            operator: 'equals',
            filterType: 'simple',
        },
        {
            field: 'title',
            operator: 'contains',
            filterType: 'simple',
        },
        {
            field: 'price',
            operator: 'range',
            filterType: 'price',
        },
        {
            field: 'created_at',
            operator: 'range',
            filterType: 'date',
        },
        {
            field: 'updated_at',
            operator: 'range',
            filterType: 'date',
        },
        {
            field: 'vendorId',
            operator: 'equals',
            filterType: 'number',
        },
        {
            field: 'expenseTypeId',
            operator: 'equals',
            filterType: 'number',
            isRelationshipOf: 'expenseTypes',
            relationshipField: 'id',
        }
    ];

    async store(item: ICreateExpenseRequest) {
        const res =  await this.db.expense.create({
            data: {
                title: item.title,
                user: {connect: {id: item.userId}}
            }
        });

        return this.update(res.id, item);
    }

    async update(id: number, item: ICreateExpenseRequest) {
        // @ts-ignore
        delete item.id;//Just in case. Prisma crashes with this

        if (item.price) {
            item.price = moneyToDbFormat(item.price);
            console.log(item.price)
        }

        if (!item.vendorId) {
            delete item.vendorId;
        }

        if (!item.vendor) {
            delete item.vendor;
        }

        if (item.vendorId) {
            item.vendor = {connect: {id: item.vendorId}};
            delete item.vendorId;
        }

        if (item.attachments) {
            const attachmentsResult = await (new AttachmentsService()).storeMany(id, item.userId as number, item.attachments.filter(i => !i.id));

            // @ts-ignore
            item.attachments = {connect: attachmentsResult.map(a => {return {id: a.id}})};
        }

        if (item.expenseTypes) {
            // @ts-ignore
            item.expenseTypes = {set: item.expenseTypes.map(type => {return {id: type.id}})};
        }


        if (item.userId) {
            item.user = {connect: {id: item.userId}};
            delete item.userId;
        }

 /*       console.log(JSON.stringify({
            where: {id},
            data: {...item, ...{updated_at: new Date().toISOString()}},
        }))*/

        return await this.db.expense.update({
            where: {id},
            data: {...item, ...{updated_at: new Date().toISOString()}},
        });
    }

    async find(params: IFindManyFilters, relationships: string[] = []): Promise<IPagination<Expense>> {

        const query = new SetupPrismaQuery(this.db.expense, new FindManyFilters(), params)
            .addRelationships(relationships)
            .addFilteredFields(this.filteredFields);
        query.withPriceTotal = true;
        return await query.paginate();

    }

    async findOne(filter: IGenericObject, relationships: string[] = []): Promise<Expense> {
        // const {key, value} = extractSingleFilterFromObject(filter);
        let include: {[key: string]: boolean} = {};
        relationships.forEach(rel => include[rel] = true);

        if (Object.keys(include).length === 0) {
            include = undefined as any;
        }

        const result = await this.db.expense.findFirst({
            where: filter,
            include
        });

        //convert attachments to allow previews
        const attachmentService = new AttachmentsService();
        if (Array.isArray(result.attachments) && result.attachments.length > 0 && process.env.OBJECT_STORAGE_DRIVER) {
            const tmp = Object.assign([], result.attachments);
            result.attachments = [];
            for (let i = 0; tmp.length > i; i++) {
                const preview = await attachmentService.getPreviewImageFromStorage(tmp[i]);

                result.attachments.push({...tmp[i], preview})
            }
        }

        return result;

    }

    /**
     * We have to execute a raw query cause Prisma does not support cascading deletes
     * @param id
     */
    async delete(id: number) {
        return await this.db.$queryRaw(`DELETE from Expense WHERE Expense.id = ${id}`);
    }
}

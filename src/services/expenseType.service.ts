import {Service} from "typedi";
import {BaseDbService} from "./base-db.service";
import {FindManyFilters, IFindManyFilters, IGenericObject, IPagination} from "../models/generic";
import {Expense, ExpenseType} from "@prisma/client";
import {IFilteredField, SetupPrismaQuery} from "../models/prisma.model";
import {ICreateExpenseRequest} from "./expenses.service";
import {moneyToDbFormat} from "../helpers/price";
import {AttachmentsService} from "./attachments.service";
export interface ICreateExpenseTypeRequest {
    title: string
}

@Service()
export class ExpenseTypeService extends BaseDbService {
    filteredFields: IFilteredField[] = [
        {
            field: 'id',
            operator: 'equals',
            filterType: 'simple',
        },
        {
            field: 'title',
            operator: 'contains',
            filterType: 'simple',
        },
    ];

    async all(params: IFindManyFilters = {}, relationships: string[] = []) {
        const query = new SetupPrismaQuery(this.db.expenseType, new FindManyFilters(), params)
            .addRelationships(relationships)
            .addFilteredFields(this.filteredFields);
        return await query.findMany();
    }

    async find(params: IFindManyFilters = {}, relationships: string[] = []): Promise<IPagination<ExpenseType>> {
        const query = new SetupPrismaQuery(this.db.expenseType, new FindManyFilters(), params)
            .addRelationships(relationships)
            .addFilteredFields(this.filteredFields);
        return await query.paginate();
    }

    async findOne(filter: IGenericObject, relationships: string[] = []): Promise<Expense> {
        let include: {[key: string]: boolean} = {};
        relationships.forEach(rel => include[rel] = true);

        if (Object.keys(include).length === 0) {
            include = undefined as any;
        }

        return  await this.db.expenseType.findFirst({
            where: filter,
            include
        });
    }

    async store(item: ICreateExpenseTypeRequest) {
        const res =  await this.db.expenseType.create({
            data: {
                title: item.title,
            }
        });

        return this.update(res.id, item);
    }

    async update(id: number, item: ICreateExpenseTypeRequest) {
        // @ts-ignore
        delete item.id;//Just in case. Prisma crashes with this


/*
        console.log(JSON.stringify({
            where: {id},
            data: {...item, ...{updated_at: new Date().toISOString()}},
        }))
*/

        return await this.db.expenseType.update({
            where: {id},
            data: {...item, ...{updated_at: new Date().toISOString()}},
        });
    }

    async delete(id: number) {
        return await this.db.expense.delete({where: {id}});
    }
}

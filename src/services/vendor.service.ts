import {BaseDbService} from "./base-db.service";
import {FindManyFilters, IFindManyFilters, IGenericObject, IPagination} from "../models/generic";
import {Expense, ExpenseType, Vendor} from "@prisma/client";
import {extractSingleFilterFromObject} from "../helpers/extractFiltersFromObject";
import {IFilteredField, SetupPrismaQuery} from "../models/prisma.model";
import {ICreateExpenseTypeRequest} from "./expenseType.service";

export class VendorService extends BaseDbService {
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
        {
            field: 'vendor_type',
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
        const query = new SetupPrismaQuery(this.db.vendor, new FindManyFilters(), params)
            .addRelationships(relationships)
            .addFilteredFields(this.filteredFields);
        return await query.findMany();
    }

    async find(params: IFindManyFilters = {}, relationships: string[] = []): Promise<IPagination<ExpenseType>> {
        const query = new SetupPrismaQuery(this.db.vendor, new FindManyFilters(), params)
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

        return  await this.db.vendor.findFirst({
            where: filter,
            include
        });
    }

    async store(item: ICreateExpenseTypeRequest) {
        const res =  await this.db.vendor.create({
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

        return await this.db.vendor.update({
            where: {id},
            data: {...item, ...{updated_at: new Date().toISOString()}},
        });
    }

    async delete(id: number) {
        return await this.db.vendor.delete({where: {id}});
    }
}

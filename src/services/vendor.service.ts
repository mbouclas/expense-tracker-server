import {BaseDbService} from "./base-db.service";
import {FindManyFilters, IFindManyFilters, IGenericObject, IPagination} from "../models/generic";
import { Vendor} from "@prisma/client";
import {extractSingleFilterFromObject} from "../helpers/extractFiltersFromObject";
import {IFilteredField, SetupPrismaQuery} from "../models/prisma.model";

export class VendorService extends BaseDbService {
    filteredFields: IFilteredField[] = [
        {
            field: 'id',
            operator: 'equals',
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

    async store() {

    }

    async update() {

    }

    async all(params: IFindManyFilters = {}, relationships: string[] = []) {
        const query = new SetupPrismaQuery(this.db.vendor, new FindManyFilters(), params)
            .addRelationships(relationships)
            .addFilteredFields(this.filteredFields);
        return await query.findMany();
    }

    async find(params: IFindManyFilters = {}, relationships: string[] = []): Promise<IPagination<Vendor>> {
        const query = new SetupPrismaQuery(this.db.vendor, new FindManyFilters(), params)
            .addRelationships(relationships)
            .addFilteredFields(this.filteredFields);
        return await query.paginate();
    }

    async findOne(filter: IGenericObject, relationships: string[] = []): Promise<Vendor> {
        const {key, value} = extractSingleFilterFromObject(filter);
        return await this.db.vendor.findFirst();
    }

    async delete() {

    }
}

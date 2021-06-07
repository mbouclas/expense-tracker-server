import {FindManyFilters, IFindManyFilters, IGenericObject} from "./generic";
import {findIndex} from 'lodash';
import {PrismaClient} from "@prisma/client/scripts/default-index";
import {moneyFromDbFormat, moneyToDbFormat} from "../helpers/price";

export interface IFilteredField {
    field: string;
    filterType: 'simple' | 'range' | 'date' | 'number' | 'boolean' | 'price'|"relationship";
    operator: 'equals' | 'startsWith' | 'endsWith' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'notIn' | 'contains' | 'mode' | 'AND' | 'OR' | 'NOT' | 'range';
    isRelationshipOf?: string;
    relationshipField?: string;
}

export class SetupPrismaQuery {
    public where: IGenericObject = {};
    public select: IGenericObject = {};
    public data: IGenericObject = {};
    public params: IFindManyFilters = {};
    protected q: IGenericObject = {};
    public limit = 10;
    public pages = 0;
    public page = 1;
    public relationships: { [key: string]: boolean } = {};
    public orderBy = 'id';
    public way = 'asc';
    public withPriceTotal = false;

    constructor(protected model: PrismaClient, protected filters: FindManyFilters, params?: IFindManyFilters) {
        if (params) {
            this.addParams(params);
        }

        this.limit = (this.params.limit) ? parseInt(this.params.limit as any) : 10;
        this.page = (this.params.page) ? this.params.page : 1;
        this.orderBy = (this.params.orderBy) ? this.params.orderBy : this.orderBy;
        this.way = (this.params.way) ? this.params.way : this.way;
    }

    addParams(params: IFindManyFilters) {
        this.params = params;
    }

    addFilteredFields(filterList: IFilteredField[]) {
        for (let key in this.params) {
            const idx = findIndex(filterList, {field: key});
            if (idx === -1) {
                continue;
            }

            // setup a relationship field
            if (filterList[idx].isRelationshipOf) {
                this.where = {...this.where, ...this.setupWhereRelationalField(this.params[key], filterList[idx])};
            } else {
                this.where = {...this.where, ...this.setupWhereField(key, this.params[key], filterList[idx])};
            }


        }

        return this;
    }

    addData(key: string, value: IGenericObject | string | number | boolean) {
        this.data[key] = value;

        return this;
    }

    addSelect(key: string, value = true) {
        this.select[key] = value;

        return this;
    }

    addWhere(key: string, value: IGenericObject | string | number | boolean) {
        this.where[key] = value;

        return this;
    }

    async count() {
        const q = Object.assign({}, this.query());
        delete q.include;
        delete q.select;
        delete q.limit
        delete q.orderBy
        return await this.model.count(q);
    }

    async sum(field = 'price'): Promise<number> {
        const q = Object.assign({}, this.query());
        delete q.include;
        delete q.select;
        delete q.orderBy;
        delete q.limit;
        const sum: IGenericObject = {};
        sum[field] = true;
        q.sum = sum;

        const res = await this.model.aggregate(q);

        return (res.sum && res.sum[field]) ?  res.sum[field] : 0;
    }

    async groupBy(field = 'vendorId') {
        const q = Object.assign({}, this.query());
        delete q.include;
        delete q.select;
        delete q.orderBy;
        delete q.limit;
        q.by = [field];

        q._count = {
            price: true,
        };

/*        q._count = {
            id: true
        }*/

        return await this.model.groupBy(q);

    }

    async findMany() {
        const q = this.query();

        return await this.model.findMany(q);
    }

    async paginate() {
        const total = await this.count();
        const pages = this.getPages(total);
        const q = this.query();
        q.take = this.limit;

        if (this.params.page) {
            q.skip = this.limit * (this.params.page - 1);
        }

        const data = await this.model.findMany(q);
        let totalPrice;
        if (this.withPriceTotal) {
            totalPrice = moneyFromDbFormat(await this.sum());
        }

        return {
            data,
            limit: this.limit,
            page: this.page,
            pages,
            total,
            totalPrice,
        };
    }

    query() {
        if (process.env.DEBUG && process.env.DEBUG.indexOf('log:queries') !== -1) {
            console.log("Query Debug: ",JSON.stringify(this.where))
        }

        if (Object.keys(this.where).length > 0) {
            this.q.where = this.where;
        }

        if (Object.keys(this.select).length > 0) {
            this.q.where = this.select;
        }

        if (Object.keys(this.data).length > 0) {
            this.q.where = this.data;
        }

        if (Object.keys(this.relationships).length > 0) {
            this.q.include = this.relationships;
        }

        const orderBy: IGenericObject = {};
        orderBy[this.orderBy] = this.way;
        this.q.orderBy = [orderBy];

        return this.q;
    }

    getPages(total: number) {
        return Math.ceil(total / this.limit);
    }

    private setupWhereField(key: string, filter: any, filteredField: IFilteredField) {
        const returnObject: IGenericObject = {};
        if (filteredField.operator === 'equals' && !Array.isArray(filter) && !filteredField.relationshipField) {
            returnObject[key] =  { equals: this.convertFieldType(filteredField, filter) };
        }

        if (filteredField.operator === 'equals' && !Array.isArray(filter) && filteredField.relationshipField) {
            const tmp: IGenericObject = {};
            tmp[filteredField.relationshipField] = this.convertFieldType(filteredField, filter);
            returnObject.some = tmp;
        }

        if (['equals','in'].indexOf(filteredField.operator) !== -1  && Array.isArray(filter)) {
            if (filteredField.relationshipField) {
                const tmp: IGenericObject = {};
                tmp[filteredField.relationshipField] = {
                    in: filter.map((f: any) => this.convertFieldType(filteredField, f))
                };
                returnObject.some = tmp;
            } else {
                returnObject[key] = {
                    in: filter.map((f: any) => this.convertFieldType(filteredField, f))
                };
            }

        }

        if (filteredField.operator === 'contains') {
            returnObject[key] = {
                contains: filter
            };
        }

        if (filteredField.operator === 'range' && (filter.min || filter.max)) {
            const min: IGenericObject = {};
            const max: IGenericObject = {};
            const minMax = [];
            if (filter.min) {
                filter.min = this.convertFieldType(filteredField, filter.min);
                min[key] = {gt: filter.min};
                minMax.push(min);
            }

            if (filter.max) {
                filter.max = this.convertFieldType(filteredField, filter.max);
                max[key] = {lt: filter.max};
                minMax.push(max);
            }

            returnObject.AND = (!Array.isArray(this.where.AND)) ? minMax : [...this.where.AND, ...minMax];
        }

        return returnObject;
    }

    private convertFieldType(filteredField: IFilteredField, value: any) {
        if (!filteredField.filterType) {
            return value;
        }

        switch (filteredField.filterType) {
            case "number":
                value = parseInt(value);
                break;
            case "boolean":
                value = (value === 'true');
                break;
            case "date":
                value = new Date(value);
                break;
            case "price":
                value = moneyToDbFormat(parseInt(value));
                break;
        }

        return value;
    }

    addRelationships(relationships: string[]) {
        relationships.forEach(rel => this.relationships[rel] = true);


        return this;
    }

    private setupWhereRelationalField(filter: any, filteredField: IFilteredField) {
        if (!filteredField.isRelationshipOf || !filteredField.relationshipField) {return;}
        // return this.setupWhereField(key, filter, filteredField)
        const tmp: IGenericObject = {};
        tmp[filteredField.isRelationshipOf] = this.setupWhereField(filteredField.relationshipField, filter, filteredField);
        return tmp;
    }
}

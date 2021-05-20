import {BaseDbService} from "./base-db.service";
import {IFilteredField, SetupPrismaQuery} from "../models/prisma.model";
import {FindManyFilters, IFindManyFilters, IGenericObject, IPagination} from "../models/generic";
import {Attachment, User} from "@prisma/client";
import {extractSingleFilterFromObject} from "../helpers/extractFiltersFromObject";

export interface IUser extends User {
    attachments?: Attachment[];
}

export class UserService extends BaseDbService {
    filteredFields: IFilteredField[] = [
        {
            field: 'id',
            operator: 'equals',
            filterType: 'simple',
        },
        {
            field: 'email',
            operator: 'contains',
            filterType: 'simple',
        },
    ];

    async store() {

    }

    async update() {

    }

    async find(params: IFindManyFilters): Promise<IPagination<User>> {
        const query = new SetupPrismaQuery(this.db.user, new FindManyFilters(), params)
            .addFilteredFields(this.filteredFields);

        return await query.paginate();
    }

    async findOne(filter: IGenericObject, relationships: string[] = []): Promise<User> {
        const {key, value} = extractSingleFilterFromObject(filter);
        return await this.db.user.findFirst();
    }

    async delete() {

    }
}

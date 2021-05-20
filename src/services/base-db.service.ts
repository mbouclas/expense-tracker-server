import {Prisma} from "../index";
import {PrismaClient} from "@prisma/client/scripts/default-index";

export class BaseDbService {
    public db: PrismaClient;

    constructor() {
        this.db = Prisma;
    }
}

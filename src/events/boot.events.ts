import {AppState, Event, Prisma} from "../index";
import {ViewEngine} from "../Server";
import {ExpensesService} from "../services/expenses.service";
import {FirstTimeBootService} from "../services/firstTimeBoot.service";
import {JwtService} from "../services/jwt.service";
import {ObjectStorageService} from "../services/object-storage/ObjectStorage.service";

let registered = false;

module.exports = () => {
    if (registered) {return;}

    Event.on('pre-boot.done', () => {

        AppState.defaultLanguageCode = 'en';
        ViewEngine.options.globals = {...ViewEngine.options.globals, ...{
                AppState
            }};
    });

    Event.on('server.started', async () => {
        // @ts-ignore
        Prisma.$on("query", async (e) => {
            if (process.env.DEBUG && process.env.DEBUG.indexOf('log:queries') === -1) {
                return;
            }
            // @ts-ignore
            console.log(`${e.query} ${e.params}`)
        });

        // Check for first time boot and pre-populate the DB
        await (new FirstTimeBootService()).prePopulateDb();
/*        const r = await (new ExpensesService()).groupByExpenseType({
            purchased_at: {
                min: '2021-03-31T21:00:00.000Z'
            }
        })

        console.log(r)*/
    });

    registered = true;
}

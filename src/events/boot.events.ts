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
/*        const payload = {expenseTypes:
               [{"id": 1}, {"id": 2}],
            userId: 1,
            "title": "blah",
            "price": 120000,
            vendor: {connect: {id: 1}},
            attachments: [
                {
                    url: '86e3a811-4f88-4816-bea9-b3d377b9dea3.jpg',
                    attachment_type: 'image'
                }

            ],
        };
        (new ExpensesService()).update(17, payload as any)
            // .then(r => console.log(r))
            .catch(e => console.log(e))*/
/*        await Prisma.expense.update({
            where:{id:17},

            data: {expenseTypes:
                    {"set": [{"id": 1}, {"id": 2}]},
                "title": "blah",
                "price": 120000,
                vendor: {connect: {id: 1}},
                attachments: {
                    set: [
                        {
                            id: 1,

                        }
                    ]
                },

            }
        })*/


        // const s = new JwtService();
        // console.log(s.decodeSession('eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJtYm91Y2xhc0BnbWFpbC5jb20iLCJkYXRlQ3JlYXRlZCI6MTYyMDE5NTM5MjA5OCwiaXNzdWVkIjoxNjIwMTk1MzkyMDk4LCJleHBpcmVzIjoxNjIyNzg3MzkyMDk4fQ.3blC6sn4xDRialARdbQD00hx9QaDfNbZkIhx5FbIYqH2zY2npncGGJkmvAiArqm1fXUplHlD15PlA1mebL9NRQ'))
/*        const r =await (new ExpensesService().find(
            {
                limit: 10,
                page: 1,
                // id: [23,4],
                expenseTypeId: "3"
                // price: {min: 100, max: 40000},
                // created_at: {min: '2021-04-28T08:25:06.079Z'},
            }))

        console.log(r.data.map(i => i.id))*/
/*        const r = await Prisma.expense.findMany({
            where: {
                expenseTypes: {
                    some: {
                        id: {in: [1,3]}
                    }
                }
            }
        })

        console.log(r.map(i => i.id));*/

/*        const r = await Prisma.expense.create({
            data: {
                userId: 1,
                expenseTypeId: 2,
                title: 'testttt',
                price: 10000
            }
        })
        console.log(r)*/
/*        const res = await Prisma.user.create({
            data: {
                firstName: 'Michael',
                lastName: 'Bouclas',
                email: 'mboouclas@gmail.com'
            }
        });*/

/*        const user = await Prisma.user.findFirst({
            where: {email: 'mbouclas@gmail.com'},
            select: {
                email: true,
                _count: {
                    select: {
                        expenses: true,
                        attachments: true,
                    }
                }
            },
        });*/

// console.log(user)
/*    if (user && user.id) {
        const expense = await Prisma.expense.create({
            data: {
                title: 'A test',
                user: {
                    connect: {
                        id: user.id
                    }
                }
            },
        });
    }*/



        // const all = await Prisma.user.findMany();
        // console.log(all)

    });

    registered = true;
}

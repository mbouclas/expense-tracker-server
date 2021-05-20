import "reflect-metadata";
require('dotenv').config();
process.env.IS_CLI="true";
import {PrismaClient} from "@prisma/client";
import {BaseCliCommand} from "./cli/base-command";
import {CreateUserCommand} from "./cli/create-user.command";


const argv = require('minimist')(process.argv.slice(2));
const colors = require('colors');
export let Prisma = new PrismaClient({
    log: [
        /*        {
                    emit: "event",
                    level: "query",
                },*/
    ],
});

export const commands: typeof BaseCliCommand[] = [
    CreateUserCommand,
];

export class CLI {
    commands: { [key: string]: BaseCliCommand } = {};

    constructor() {
        commands.map(command => new command()).forEach(command => this.commands[command.command] = command);
    }

    commandExists(command: string) {
        return this.commands[command];
    }
};

export interface ICommandResult {
    success: boolean;
    reason?: string;
    return?: any;
}

(async () => {
    await Prisma.$connect();

    const cli = new CLI();
    if (typeof argv['_'][0] == 'undefined' || argv['_'][0] == null) { //show all commands
        console.log(colors.yellow('Available commands'));
        for (let key in cli.commands) {
            console.log(colors.green(key) + ' ::  ' + cli.commands[key].description);
        }

        process.exit();
    }

    const command = argv['_'][0];

    const Command = await cli.commandExists(command);
    if (!Command) {process.exit();}

    Command.options = argv;

    let res;
    try {
        res = await Command.fire();
        if (!res.success) {
            console.log(colors.red(`${command} failed.`), colors.red(res.reason));
            process.exit();
        }
    }
    catch (e) {
        console.log(colors.red(`${command} failed.`), colors.red(e.message));
        console.log(e)
    }

    if (!res.return) {
        console.log(colors.green(`${command} completed`))
        process.exit();
    }


    console.log(res.return);

    process.exit();
})();



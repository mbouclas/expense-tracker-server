import {BaseCliCommand, delay} from "./base-command";
import inquirer from "inquirer";
import {Prisma} from "../cli";
import {BcryptHasher} from "../helpers/hasher";
const colors = require('colors');
interface CreateUserCommandArgs {
    fistName: string;
    lastName: string;
    email: string;
    password: string;
}


export class CreateUserCommand extends BaseCliCommand {
    command = 'createUser';
    description = 'Creates a user';

    constructor() {
        super();
    }

    async fire(args: CreateUserCommandArgs) {
        await delay(500, '');

        const answers = await inquirer
            .prompt([
                {
                    name: 'firstName',
                    message: 'First Name',
                },
                {
                    name: 'lastName',
                    message: 'Last Name',
                },
                {
                    name: 'email',
                    message: 'email',
                },
                {
                    name: 'password',
                    message: 'Password',
                    type: 'password',
                },
            ]);



        // Lookup for existing
        const exists = await Prisma.user.findFirst({
            where: {
                email: answers.email
            }
        });

        if (exists) {
            return {
                success: false,
                reason: 'User exists'
            }
        }

        answers.password = await (new BcryptHasher()).hashPassword(answers.password);

        const res = await Prisma.user.create({
            data: answers
        });

        console.log(colors.yellow(`User created with id ${res.id}`));

        return {
            success: true
        }
    }
}

import {BaseCliCommand, delay} from "./base-command";
import inquirer from "inquirer";
import {Prisma} from "../cli";
import {BcryptHasher} from "../helpers/hasher";
import {CreateUserCommandArgs} from "./create-user.command";
const colors = require('colors');

export class UpdateUserCommand extends BaseCliCommand {
    command = 'updateUser';
    description = 'Updates a user';

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

        if (!exists) {
            return {
                success: false,
                reason: 'User does not exist'
            }
        }

        answers.password = await (new BcryptHasher()).hashPassword(answers.password);

        const res = await Prisma.user.update({
            where: {email: answers.email},
            data: answers
        });

        console.log(colors.yellow(`User updated`));

        return {
            success: true
        }
    }
}

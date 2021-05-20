import {compare, genSalt, hash} from "bcryptjs";

export type HashPassword = (
    password: string,
    rounds: number,
) => Promise<string>;

export interface PasswordHasher<T = string> {
    hashPassword(password: T): Promise<T>;
    comparePassword(providedPass: T, storedPass: T): Promise<boolean>;
}


export async function hashPassword(
    password: string,
    rounds: number,
): Promise<string> {
    const salt = await genSalt(rounds);
    return await hash(password, salt);
}

export class BcryptHasher implements PasswordHasher<string> {
    constructor(
        private readonly rounds = 10
    ) {}

    async hashPassword(password: string): Promise<string> {
        const salt = await genSalt(this.rounds);
        return await hash(password, salt);
    }

    async comparePassword(
        providedPass: string,
        storedPass: string,
    ): Promise<boolean> {
        return  await compare(providedPass, storedPass);

    }


}

export function tokenGenerator (length: number = 10) {
    let text = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < length; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

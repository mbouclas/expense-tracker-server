export function moneyToDbFormat(input: number): number {
    return parseInt(input as any) * 100;
}

export function moneyFromDbFormat(input: number): number {
    return input/100;
}

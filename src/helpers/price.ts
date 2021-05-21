export function moneyToDbFormat(input: number): number {
    return Math.round(input * 100);
}

export function moneyFromDbFormat(input: number): number {
    return input/100;
}

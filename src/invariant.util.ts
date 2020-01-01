export const invariant = (check: boolean, message: string) => {
    if (!check) {
        throw new Error(`[Redux Action Promise Invariant Error]: ${message}`);
    }
}
export function isArray<T>(array: any | T[]): array is T[] {
    const inputType = typeof array;
    return inputType === 'object' && array && typeof array.length === 'number';
}
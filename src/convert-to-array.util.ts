import { isArray } from './is-array.util';

export const convertToArray = <T>(input: T | T[]): T[] => {
    if (isArray(input)) {
        return input;
    }
    const arr = [];
    if (input) {
        arr.push(input);
    }
    return arr;
};

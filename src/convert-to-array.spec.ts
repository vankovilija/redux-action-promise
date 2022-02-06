import {convertToArray} from "./convert-to-array.util";

describe('convertToArray', () => {
    it('converts an input to an array', () => {
        const arr = convertToArray('test');
        expect(arr.length).toBe(1);
    });

    it('returns the input value directly if it is already an array', () => {
        const arr = ['test'];
        const result = convertToArray(arr);
        expect(result).toBe(arr);
    });

    it ('returns an empty array if undefined is passed', () => {
        const arr = convertToArray(undefined);
        expect(arr.length).toBe(0);
    })
});
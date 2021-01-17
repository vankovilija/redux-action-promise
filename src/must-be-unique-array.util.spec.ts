import { mustBeUniqueArray } from "./must-be-unique-array.util";


describe('mustBeUniqueArray is a functionality to determine that input is an array with unique elements, without external dependencies', () => {
    it ('throws if the input is an array with duplicates', () => {
        expect(() => mustBeUniqueArray(['one', 'two', 'one'], (item) => `${item} is a duplicate`)).toThrowError('one is a duplicate');
    });

    it ('continues if the input is a array with at least one element', () => {
        expect(() => mustBeUniqueArray(['one', 'two'], (item) => `${item} is a duplicate`)).not.toThrowError();
    });
});
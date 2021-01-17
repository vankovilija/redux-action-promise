import { mustNotContainArray } from './must-not-contain-array.util';


describe('mustNotContainArray is a functionality to determine that no elements from array1 are contained in array2, without external dependencies', () => {
    it ('throws if the array2 contains at least 1 elements from array 1', () => {
        expect(() => mustNotContainArray(['one', 'two'], ['four', 'five', 'one'], (item) => `${item} is contained in both arrays`)).toThrowError('one is contained in both arrays');
    });

    it ('continues if the input is a array with at least one element', () => {
        expect(() => mustNotContainArray(['one', 'two'], ['four', 'five'], (item) => `${item} is contained in both arrays`)).not.toThrowError();
    });
});
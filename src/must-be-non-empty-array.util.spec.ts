import { mustBeNonEmptyArray } from './must-be-non-empty-array.util';


describe('mustBeNonEmptyArray is a functionality to determine that input is a array with at least 1 element, without external dependencies', () => {
    it ('throws if the input is a empty array', () => {
        expect(() => mustBeNonEmptyArray([], 'testArray')).toThrowError('testArray must be a non-empty array');
    });

    it ('continues if the input is a array with at least one element', () => {
        expect(() => mustBeNonEmptyArray([1], 'testArray')).not.toThrowError();
    });
});
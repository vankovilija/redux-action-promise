import { mustBeArray } from './must-be-array.util';

describe('mustBeArray functionality to determine that input is an array, without external dependencies', () => {
    it ('throws an error when the input is not an array', () => {
        expect(() => mustBeArray(1, 'testArray')).toThrowError('testArray must be an array');
    });

    it ('continues when the input is an array', () => {
        expect(() => mustBeArray([], 'testArray')).not.toThrowError();
    });
});
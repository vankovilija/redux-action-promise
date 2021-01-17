import { mustBeNumber } from "./must-be-number.util";


describe('mustBeNumber is a functionality to determine that input is a number, without external dependencies', () => {
    it ('throws if the input is not a number', () => {
        expect(() => mustBeNumber('hi', 'testNumber')).toThrowError('testNumber must be a number');
    });

    it ('continues if the input is a array with at least one element', () => {
        expect(() => mustBeNumber(1, 'testNumber')).not.toThrowError();
    });
});
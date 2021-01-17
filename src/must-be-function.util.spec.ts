import { mustBeFunction } from "./must-be-function.util";

describe('mustBeFunction is a functionality to determine that input is a function, without external dependencies', () => {
    it ('throws if the input is not a function', () => {
        expect(() => mustBeFunction(1, 'testFunction')).toThrowError('testFunction must be a function');
    });

    it ('continues if the input is a function', () => {
        expect(() => mustBeFunction(() => undefined, 'testFunction')).not.toThrowError();
    });
});
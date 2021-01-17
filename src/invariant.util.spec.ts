import { invariant } from './invariant.util';

describe('invariant is used to throw errors', () => {
    it ('throws an error when statement is false with a specific format',  () => {
        expect(() => invariant(false, 'test error')).toThrowError('[Redux Action Promise Invariant Error]: ');
    });

    it ('continues when statement is true', () => {
        expect(() => invariant(true, 'test error')).not.toThrowError();
    })
});
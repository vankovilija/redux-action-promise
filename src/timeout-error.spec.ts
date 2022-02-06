import {TimeoutError} from "./timeout-error";

describe('TimeoutError', () => {
    it('Creates a timeout error class', () => {
        const timeoutError = new TimeoutError();
        expect(timeoutError.message).toBe('Timed out promise');
        expect(timeoutError).toBeInstanceOf(Error);
    });

    it ('Passes the error message down to the Error class', () => {
        const timeoutError = new TimeoutError('test');
        expect(timeoutError.name).toBe('TimeoutError');
        expect(timeoutError.message).toBe('test');
        expect(timeoutError).toBeInstanceOf(Error);
    })
})
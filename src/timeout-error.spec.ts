import {TimeoutError} from "./timeout-error";

describe('TimeoutError', () => {
    it('Creates a timeout error class', () => {
        const timeoutError = new TimeoutError('test');
        expect(timeoutError.name).toBe('TimeoutError');
        expect(timeoutError.message).toBe('test');
        expect(timeoutError).toBeInstanceOf(Error);
        const timeoutError2 = new TimeoutError();
        expect(timeoutError2.message).toBe('Timed out promise');
    })
})
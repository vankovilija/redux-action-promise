export class TimeoutError extends Error {
    constructor(message = 'Timed out promise') {
        super(message);
        this.name = 'TimeoutError';
    }
}

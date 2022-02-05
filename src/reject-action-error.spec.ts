import {RejectActionError} from "./reject-action-error";

describe('RejectActionError', () => {
    it('creates a RejectActionError instance', () => {
        const rejectActionError = new RejectActionError({type: 'test'});
        expect(rejectActionError.message).toBe('Rejected action test');
        expect(rejectActionError).toBeInstanceOf(Error);
    })
})
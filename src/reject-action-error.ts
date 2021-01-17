import { Action } from 'redux';

export class RejectActionError extends Error {
    rejectAction: Action;

    constructor(rejectAction: Action) {
        super(`Rejected action ${rejectAction.type}`);
        this.name = 'RejectAction';
        this.rejectAction = rejectAction
    }
}

import {QueueItem} from './queue-item.interface';
import {Action, AnyAction} from 'redux';
import {QueueState} from './queue-state.enum';
import {CancelablePromise} from "../action-promise-store.interface";

export type QueueMemberItem<A extends Action = AnyAction> = (QueueItem<A> &
    {
        id: number,
        processingPromise: CancelablePromise,
        resolve: (result: any) => void,
        reject: (error: Error) => void
    });

export interface QueueType<A extends Action = AnyAction> {
    items: QueueMemberItem<A>[]
    state: QueueState
}
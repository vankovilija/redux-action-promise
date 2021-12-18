import {Action, AnyAction} from 'redux';
import { RequestAction } from "../action-promise-store.interface";

export type QueueItem<A extends Action = AnyAction> = RequestAction<A> & {
    priority: Number
}
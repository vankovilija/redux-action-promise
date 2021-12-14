import {Action, AnyAction} from 'redux';
import {ArrayOrSingleAnyTypeOfAction} from "../action-promise-store.interface";

export interface QueueItem<A extends Action = AnyAction> {
    startAction: A,
    endActions: ArrayOrSingleAnyTypeOfAction<A>,
    errorActions?: ArrayOrSingleAnyTypeOfAction<A>,
    priority: Number
}
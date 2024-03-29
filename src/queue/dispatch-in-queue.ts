import {Action, AnyAction} from 'redux';
import {QueueType} from './queue.interface';
import {QueueItem} from './queue-item.interface';
import {isQueueItem} from './is-queue-item.util';
import {isActionObject} from '../subscribe-to-actions/is-action-object.util';
import {invariant} from '../invariant.util';
import {ProcessQueue} from './process-queue';
import {removeFromQueue} from "./remove-from-queue";
import {createRequestAction, isRequestAction} from "../create-request-action";
import {ArrayOrSingleAnyTypeOfAction, CancelablePromise, RequestAction} from "../action-promise-store.interface";
import {isActionCreator} from "../subscribe-to-actions/is-action-creator.util";
import {createQueueItem} from "./create-queue-item";

let latestItemID: number = 0;

export type DispatchInQueue<A extends Action = AnyAction> = ((
    action: (A | QueueItem),
    completeActions?: ArrayOrSingleAnyTypeOfAction<A>,
    errorActions?: ArrayOrSingleAnyTypeOfAction<A>,
    priority?: Number
) => CancelablePromise);

export const MAX_QUEUE_ITEMS = 100000000;

export const dispatchInQueue = <A extends Action = AnyAction>(
    queue: QueueType,
    processQueue: ProcessQueue<A>,
    startIndex?: number
) => {
    if (startIndex !== undefined) {
        latestItemID = startIndex;
    }
    return (<A extends Action = AnyAction>(
        action: (A | RequestAction | QueueItem),
        completeActions?: ArrayOrSingleAnyTypeOfAction<A>,
        errorActions?: ArrayOrSingleAnyTypeOfAction<A>,
        priority?: number
    ) => {
        invariant(queue.items.length < MAX_QUEUE_ITEMS, 'Exceeded max queue items');
        let queueItem: QueueItem;
        let action1;
        if (isActionCreator(action)) {
            action1 = action();
        } else {
            action1 = action;
        }
        if (isQueueItem(action1)) {
            queueItem = action1;
        } else if (isRequestAction(action1)) {
            queueItem = createQueueItem(action1, priority) as QueueItem;
        } else if (isActionObject(action1)) {
            queueItem = createQueueItem(createRequestAction(action1, completeActions, errorActions), priority) as QueueItem;
        } else {
            invariant(false, 'Must provide Action or QueueItem as first parameter of dispatch in a queue');
        }

        let i = queue.items.length - 1;
        while (i > -1) {
            if (queueItem.priority === undefined || queue.items[i].priority === undefined || queue.items[i].priority >= queueItem.priority) {
                i++;
                break;
            }
            i--;
        }
        latestItemID ++;
        if (latestItemID > MAX_QUEUE_ITEMS) {
            latestItemID = 0;
        }
        let resolve: (result: any) => void;
        let reject: (error: Error) => void;
        const returnPromise = new Promise((rs, rj) => {
            resolve = rs;
            reject = rj;
        }) as CancelablePromise;
        queue.items.splice(i, 0, Object.assign({}, queueItem, {id: latestItemID, resolve, reject, processingPromise: undefined}));
        processQueue();
        returnPromise.cancel = removeFromQueue(queue, processQueue, latestItemID);
        return returnPromise
    })
}
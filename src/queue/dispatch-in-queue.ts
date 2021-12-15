import {Action, AnyAction} from 'redux';
import {QueueType} from './queue.interface';
import {QueueItem} from './queue-item.interface';
import {isQueueItem} from './is-queue-item.util';
import {isActionObject} from '../subscribe-to-actions/is-action-object.util';
import {invariant} from '../invariant.util';
import {ProcessQueue} from './process-queue';
import {removeFromQueue} from "./remove-from-queue";
import {isPromiseAction} from "../create-request-action";
import {ArrayOrSingleAnyTypeOfAction, CancelablePromise} from "../action-promise-store.interface";
import {convertToArray} from "../convert-to-array.util";
import {isActionCreator} from "../subscribe-to-actions/is-action-creator.util";

let latestItemID: number = 0;

export type DispatchInQueue<A extends Action = AnyAction> = ((
    action: (A | QueueItem),
    completeActions?: ArrayOrSingleAnyTypeOfAction<A>,
    errorActions?: ArrayOrSingleAnyTypeOfAction<A>,
    priority?: Number
) => CancelablePromise);

export const dispatchInQueue = <A extends Action = AnyAction>(
    queue: QueueType,
    processQueue: ProcessQueue<A>
) => (<A extends Action = AnyAction>(
    startAction: (A | QueueItem),
    completeActions?: ArrayOrSingleAnyTypeOfAction<A>,
    errorActions?: ArrayOrSingleAnyTypeOfAction<A>,
    priority?: Number
) => {
    let queueItem: QueueItem;
    if (isQueueItem(startAction)) {
        queueItem = {
            startAction: startAction.startAction,
            endActions: startAction.endActions,
            errorActions: startAction.errorActions,
            priority: startAction.priority
        };
    } else {
        let action;
        if (isActionCreator(startAction)) {
            action = startAction();
        } else {
            action = startAction;
        }
        if (isPromiseAction(action)) {
            queueItem = {
                startAction: action,
                endActions: completeActions ? completeActions : action.promise.resolveActions,
                errorActions: errorActions ? errorActions : action.promise.rejectActions,
                priority
            }
        } else if (isActionObject(action)) {
            queueItem = {
                startAction: action,
                endActions: completeActions,
                errorActions: errorActions,
                priority
            };
        } else {
            invariant(false, 'Must provide Action or QueueItem as first parameter of dispatch in a queue');
        }
    }

    queueItem.endActions = queueItem.endActions ? convertToArray(queueItem.endActions) : undefined;
    queueItem.errorActions = queueItem.errorActions ? convertToArray(queueItem.errorActions) : undefined;
    let i = queue.items.length - 1;
    while (i > -1) {
        if (queue.items[i] === undefined) {
            break;
        }
        if (queueItem.priority === undefined || queue.items[i].priority === undefined || queue.items[i].priority >= queueItem.priority) {
            i++;
            break;
        }
        i--;
    }
    latestItemID ++;
    if (latestItemID === Number.MAX_VALUE - 1) {
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
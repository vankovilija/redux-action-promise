import {QueueType} from './queue.interface';
import {DispatchFunction} from '../action-promise-store.interface';
import {Action, AnyAction} from 'redux';
import {QueueState} from './queue-state.enum';
import {removeFromQueue} from './remove-from-queue';
import {isQueueProcessing} from './is-queue-processing.util';
import {findItemInQueue} from "./find-item-in-queue.util";
import {isActionObject} from "../subscribe-to-actions/is-action-object.util";

export type ProcessQueue<A extends Action = AnyAction> = () => boolean;

const onActionComplete = <A extends Action = AnyAction>(queue: QueueType, dispatchFunction: DispatchFunction<A>, processingItemId: number, isError: boolean) => (result: any) => {
    const processingItem = findItemInQueue(queue, processingItemId);
    processingItem.processingPromise = undefined;
    const processFunction = processQueue(queue, dispatchFunction);
    removeFromQueue(queue, processFunction, processingItemId)();
    if (isError) {
        processingItem.reject(result);
    } else {
        processingItem.resolve(result);
    }
    if (queue.state === QueueState.PAUSED) {
        return;
    }
    queue.state = QueueState.WAITING;
    processFunction();
}

export const processQueue = <A extends Action = AnyAction>(
    queue: QueueType,
    dispatchFunction: DispatchFunction<A>
) => {
    return () => {
        const queueItem = queue.items[0];
        if (
            queueItem === undefined ||
            queue.state !== QueueState.WAITING ||
            isQueueProcessing(queue)
        ) {
            return false;
        }
        if (!queueItem.promise.resolveActions && !queueItem.promise.rejectActions) {
            dispatchFunction<A>(queueItem as any);
            onActionComplete(queue, dispatchFunction, queueItem.id, false)(undefined);
        } else {
            queue.state = QueueState.ACTIVE;
            const action = dispatchFunction<A>(queueItem as any);
            if (!isActionObject(action)) {
                queueItem.processingPromise = action;
                queueItem.processingPromise
                    .then(onActionComplete(queue, dispatchFunction, queueItem.id, false))
                    .catch(onActionComplete(queue, dispatchFunction, queueItem.id, true));
            }
        }
        return true;
    }
}
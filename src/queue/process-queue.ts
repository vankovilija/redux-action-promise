import {QueueType} from './queue.interface';
import {DispatchFunction, PromiseFunction} from '../action-promise-store.interface';
import {Action, AnyAction} from 'redux';
import {QueueState} from './queue-state.enum';
import {removeFromQueue} from './remove-from-queue';
import {isQueueProcessing} from './is-queue-processing.util';
import {findItemInQueue} from "./find-item-in-queue.util";

export type ProcessQueue<A extends Action = AnyAction> = () => boolean;

const onActionComplete = <A extends Action = AnyAction>(queue: QueueType, dispatchFunction: DispatchFunction<A>, promise: PromiseFunction, processingItemId: number, isError: boolean) => (result: any) => {
    const processingItem = findItemInQueue(queue, processingItemId);
    processingItem.processingPromise = undefined;
    const processFunction = processQueue(queue, promise, dispatchFunction);
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
    promise: PromiseFunction,
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
        if (queueItem.endActions) {
            queueItem.processingPromise = promise(queueItem.endActions, queueItem.errorActions);
            queueItem.processingPromise
                .then(onActionComplete(queue, dispatchFunction, promise, queueItem.id, false))
                .catch(onActionComplete(queue, dispatchFunction, promise, queueItem.id, true));
        } else {
            onActionComplete(queue, dispatchFunction, promise, queueItem.id, false)(undefined);
        }
        queue.state = QueueState.ACTIVE;
        dispatchFunction<A>(queueItem.startAction as any);
        return true;
    }
}
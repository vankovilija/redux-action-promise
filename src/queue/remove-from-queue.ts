import {QueueType} from './queue.interface';
import {findIndexInQueue} from './find-index-in-queue.util';
import {ProcessQueue} from "./process-queue";
import {Action, AnyAction} from "redux";
import {QueueState} from "./queue-state.enum";

export const removeFromQueue = <A extends Action = AnyAction>(queue: QueueType, processQueue: ProcessQueue<A>, id: number) => () => {
    const queueItemIndex = findIndexInQueue(queue, id);
    if (queueItemIndex === -1) {
        return false;
    }
    const queueItem = queue.items[queueItemIndex];
    queue.items.splice(queueItemIndex, 1);
    if (queueItem.processingPromise !== undefined) {
        queueItem.processingPromise.cancel();
        if (queue.state === QueueState.ACTIVE) {
            queue.state = QueueState.WAITING;
            processQueue();
        }
    }
    return true;
}
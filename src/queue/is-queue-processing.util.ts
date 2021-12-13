import {QueueType} from './queue.interface';

export function isQueueProcessing(queue: QueueType) {
    return queue.items.findIndex((item) => item.processingPromise !== undefined) !== -1;
}
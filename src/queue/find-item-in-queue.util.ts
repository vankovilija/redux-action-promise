import {QueueMemberItem, QueueType} from './queue.interface';
import {findIndexInQueue} from './find-index-in-queue.util';

export function findItemInQueue(queue: QueueType, id: number): QueueMemberItem {
    const index = findIndexInQueue(queue, id);
    if (index === -1) {
        return null;
    }
    return queue.items[index];
}
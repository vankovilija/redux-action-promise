import {QueueType} from './queue.interface';

export const findIndexInQueue = (queue: QueueType, id: number) => queue.items.findIndex((item) => item.id === id)
import {QueueType} from './queue.interface';
import {QueueState} from './queue-state.enum';
import {ProcessQueue} from './process-queue';
import {Action, AnyAction} from 'redux';

export type ResumeQueue = () => boolean;

export const resumeQueue = <A extends Action = AnyAction>(queue: QueueType, processQueue: ProcessQueue<A>) => () => {
    if (queue.state !== QueueState.PAUSED) {
        return false;
    }
    queue.state = QueueState.WAITING;
    processQueue();
    return true;
}
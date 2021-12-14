import {QueueType} from './queue.interface';
import {QueueState} from './queue-state.enum';

export type PauseQueue = () => boolean;

export const pauseQueue = (queue: QueueType) => () => {
    if (queue.state === QueueState.PAUSED) {
        return false;
    }
    queue.state = QueueState.PAUSED;
    return true;
}
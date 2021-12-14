import {QueueType} from "./queue.interface";
import {QueueState} from "./queue-state.enum";
import {pauseQueue} from "./pause-queue";

describe('pauseQueue changes the state of the queue, and returns true if state is updated', () => {
    const queue: QueueType = {
        items: [],
        state: QueueState.WAITING
    };
    const pauseFunction = pauseQueue(queue);

    it ('changes state to paused and returns true', () => {
        const result = pauseFunction();
        expect(queue.state).toBe(QueueState.PAUSED);
        expect(result).toBe(true);
    });

    it ('returns false when no state is changed', () => {
        const result = pauseFunction();
        expect(queue.state).toBe(QueueState.PAUSED);
        expect(result).toBe(false);
    });
});
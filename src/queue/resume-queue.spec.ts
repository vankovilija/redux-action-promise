import {QueueType} from "./queue.interface";
import {QueueState} from "./queue-state.enum";
import {resumeQueue} from "./resume-queue";

describe('resumeQueue changes the state of the queue, and returns true if state is updated, and triggers the queue to start processing', () => {
    const queue: QueueType = {
        items: [],
        state: QueueState.PAUSED
    };
    const processMock = jest.fn();
    const resumeFunction = resumeQueue(queue, processMock);

    it ('changes state to paused and returns true', () => {
        const result = resumeFunction();
        expect(queue.state).toBe(QueueState.WAITING);
        expect(result).toBe(true);
        expect(processMock).toBeCalledTimes(1);
    });

    it ('returns false when no state is changed', () => {
        const result = resumeFunction();
        expect(queue.state).toBe(QueueState.WAITING);
        expect(result).toBe(false);
        expect(processMock).toBeCalledTimes(1);
    });
});
import {QueueMemberItem, QueueType} from "./queue.interface";
import {QueueState} from "./queue-state.enum";
import {processQueue} from "./process-queue";

describe('processQueue picks up the first item in a queue if the queue is in state WAITING and processes it, continuing to the next one if state is not PAUSED', () => {
    let promiseFunction, dispatchFunction, processQueueFunction, queue: QueueType, queueItems: QueueMemberItem[];
    beforeEach(() => {
        const resolveMocks = [];
        const rejectMocks = [];
        queueItems = [];
        for (let i = 0; i < 3; i++) {
            resolveMocks.push(jest.fn());
            rejectMocks.push(jest.fn());
            const queueItem: QueueMemberItem = {
                id: i,
                processingPromise: undefined,
                resolve: resolveMocks[i],
                reject: rejectMocks[i],
                startAction: {type: `startAction${i}`},
                endActions: [{type: `endAction${i}`}],
                errorActions: undefined,
                priority: i
            }
            queueItems.push(queueItem);
        }
        queue = {
            items: [],
            state: QueueState.WAITING
        };
        promiseFunction = jest.fn(() => {
            const returnPromise = new Promise((mockResolve, mockReject) => {
                promiseFunction.resolves.push(mockResolve);
                promiseFunction.rejects.push(mockReject);
            });
            promiseFunction.promises.push(returnPromise);
            return returnPromise;
        });
        promiseFunction.resolves = [];
        promiseFunction.rejects = [];
        promiseFunction.promises = [];
        dispatchFunction = jest.fn();
        processQueueFunction = processQueue(queue, promiseFunction, dispatchFunction);
    })

    it ('if queue is empty it will not start processing', () => {
        const result = processQueueFunction();
        expect(result).toBe(false);
        expect(promiseFunction).not.toBeCalled();
        expect(dispatchFunction).not.toBeCalled();
    });

    it ('if queue has items, but state is PAUSED it will not start processing', () => {
        queue.items.push(queueItems[0])
        queue.state = QueueState.PAUSED;
        const result = processQueueFunction();
        expect(result).toBe(false);
        expect(promiseFunction).not.toBeCalled();
        expect(dispatchFunction).not.toBeCalled();
    });

    it ('if queue has items, but state is ACTIVE it will not start processing', () => {
        queue.items.push(queueItems[0])
        queue.state = QueueState.ACTIVE;
        const result = processQueueFunction();
        expect(result).toBe(false);
        expect(promiseFunction).not.toBeCalled();
        expect(dispatchFunction).not.toBeCalled();
    });

    it ('if queue has items and state is WAITING it will start processing the items', () => {
        queue.items = queueItems;
        const result = processQueueFunction();
        expect(result).toBe(true);
        expect(promiseFunction).toBeCalled();
        expect(dispatchFunction).toBeCalled();
    });

    it ('if queue item is worked on and its promise is resolved, the next item will be picked up', async () => {
        queue.items = queueItems.slice();
        const result = processQueueFunction();
        expect(result).toBe(true);
        expect(promiseFunction).toBeCalled();
        expect(dispatchFunction).toBeCalled();
        const queueStartLength = queue.items.length;
        promiseFunction.resolves[0]('test');
        await promiseFunction.promises[0];
        expect(queueStartLength - queue.items.length).toBe(1);
        expect(queue.items[0].processingPromise !== undefined).toBe(true);
        expect(queue.state).toBe(QueueState.ACTIVE);
    });

    it ('if queue item is worked on and its promise is resolved, and the queue is emptied, state goes back to WAITING', async () => {
        queue.items.push(queueItems[0]);
        processQueueFunction();
        promiseFunction.resolves[0]('test');
        await promiseFunction.promises[0];
        expect(queue.state).toBe(QueueState.WAITING);
    });

    it ('if queue item is worked on and its promise is resolved, but the queue state is PAUSED, the queue will not continue', async () => {
        queue.items = queueItems.slice();
        processQueueFunction();
        queue.state = QueueState.PAUSED;
        promiseFunction.resolves[0]('test');
        await promiseFunction.promises[0];
        expect(queue.items[0].processingPromise === undefined).toBe(true);
        expect(queue.state).toBe(QueueState.PAUSED);
    });
})
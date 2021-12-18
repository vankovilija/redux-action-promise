import {QueueMemberItem, QueueType} from "./queue.interface";
import {QueueState} from "./queue-state.enum";
import {processQueue} from "./process-queue";
import {createQueueItem} from "./create-queue-item";
import {createRequestAction} from "../create-request-action";
import {QueueItem} from "./queue-item.interface";

describe('processQueue picks up the first item in a queue if the queue is in state WAITING and processes it, continuing to the next one if state is not PAUSED', () => {
    let dispatchFunction, processQueueFunction, queue: QueueType, queueItems: QueueMemberItem[];
    beforeEach(() => {
        const resolveMocks = [];
        const rejectMocks = [];
        queueItems = [];
        for (let i = 0; i < 3; i++) {
            resolveMocks.push(jest.fn());
            rejectMocks.push(jest.fn());
            const queueItem: QueueMemberItem = {
                ...createQueueItem(createRequestAction({type: `startAction${i}`}, {type: `endAction${i}`}), i) as QueueItem,
                id: i,
                processingPromise: undefined,
                resolve: resolveMocks[i],
                reject: rejectMocks[i],
            }
            queueItems.push(queueItem);
        }
        queue = {
            items: [],
            state: QueueState.WAITING
        };

        dispatchFunction = jest.fn(() => {
            const returnPromise = new Promise((mockResolve, mockReject) => {
                dispatchFunction.resolves.push(mockResolve);
                dispatchFunction.rejects.push(mockReject);
            });
            dispatchFunction.promises.push(returnPromise);
            return returnPromise;
        });
        dispatchFunction.resolves = [];
        dispatchFunction.rejects = [];
        dispatchFunction.promises = [];
        processQueueFunction = processQueue(queue, dispatchFunction);
    })

    it ('if queue is empty it will not start processing', () => {
        const result = processQueueFunction();
        expect(result).toBe(false);
        expect(dispatchFunction).not.toBeCalled();
    });

    it ('if queue has items, but state is PAUSED it will not start processing', () => {
        queue.items.push(queueItems[0])
        queue.state = QueueState.PAUSED;
        const result = processQueueFunction();
        expect(result).toBe(false);
        expect(dispatchFunction).not.toBeCalled();
    });

    it ('if queue has items, but state is ACTIVE it will not start processing', () => {
        queue.items.push(queueItems[0])
        queue.state = QueueState.ACTIVE;
        const result = processQueueFunction();
        expect(result).toBe(false);
        expect(dispatchFunction).not.toBeCalled();
    });

    it ('if queue has items and state is WAITING it will start processing the items', () => {
        queue.items = queueItems;
        const result = processQueueFunction();
        expect(result).toBe(true);
        expect(dispatchFunction).toBeCalled();
    });

    it ('if queue item is worked on and its promise is resolved, the next item will be picked up', async () => {
        queue.items = queueItems.slice();
        const result = processQueueFunction();
        expect(result).toBe(true);
        expect(dispatchFunction).toBeCalled();
        const queueStartLength = queue.items.length;
        dispatchFunction.resolves[0]('test');
        await dispatchFunction.promises[0];
        expect(queueStartLength - queue.items.length).toBe(1);
        expect(queue.items[0].processingPromise !== undefined).toBe(true);
        expect(queue.state).toBe(QueueState.ACTIVE);
    });

    it ('if queue item is worked on and its promise is resolved, and the queue is emptied, state goes back to WAITING', async () => {
        queue.items.push(queueItems[0]);
        processQueueFunction();
        dispatchFunction.resolves[0]('test');
        await dispatchFunction.promises[0];
        expect(queue.state).toBe(QueueState.WAITING);
    });

    it ('if queue item is worked on and its promise is resolved, but the queue state is PAUSED, the queue will not continue', async () => {
        queue.items = queueItems.slice();
        processQueueFunction();
        queue.state = QueueState.PAUSED;
        dispatchFunction.resolves[0]('test');
        await dispatchFunction.promises[0];
        expect(queue.items[0].processingPromise === undefined).toBe(true);
        expect(queue.state).toBe(QueueState.PAUSED);
    });
})
import {QueueMemberItem, QueueType} from "./queue.interface";
import {QueueState} from "./queue-state.enum";
import {removeFromQueue} from "./remove-from-queue";
import {createQueueItem} from "./create-queue-item";
import {createRequestAction} from "../create-request-action";
import {QueueItem} from "./queue-item.interface";

describe('remove from queue removes items by ID and cancels them if processing', () => {
    let processFunction, queue: QueueType, queueItems: QueueMemberItem[];
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
        processFunction = jest.fn(() => {
            const returnPromise = new Promise((mockResolve, mockReject) => {
                processFunction.resolves.push(mockResolve);
                processFunction.rejects.push(mockReject);
            });
            processFunction.promises.push(returnPromise);
            return returnPromise;
        });
        processFunction.resolves = [];
        processFunction.rejects = [];
        processFunction.promises = [];
    });

    it ('doesn\'t remove items if id is not found',  () => {
        queue.items = queueItems.slice();
        queue.items.splice(1, 1);
        const removeFromQueueFunction = removeFromQueue(queue, processFunction, 1);
        const returnValue = removeFromQueueFunction();
        expect(returnValue).toBe(false);
        expect(queue.items.length).toBe(2);
    });

    it ('removes items by id from the queue',  () => {
        queue.items = queueItems.slice();
        const removeFromQueueFunction = removeFromQueue(queue, processFunction, 1);
        const returnValue = removeFromQueueFunction();
        expect(returnValue).toBe(true);
        expect(queue.items.length).toBe(2);
        expect(queue.items[1].id).not.toBe(1);
    });

    it ('cancels promises when removing items if running, and calls processQueue function',  () => {
        queue.items = queueItems.slice();
        queue.state = QueueState.ACTIVE;
        queue.items[1].processingPromise = Promise.resolve() as any;
        const cancelMock = jest.fn();
        queue.items[1].processingPromise.cancel = cancelMock;
        const removeFromQueueFunction = removeFromQueue(queue, processFunction, 1);
        removeFromQueueFunction();
        expect(cancelMock).toBeCalled();
        expect(processFunction).toBeCalled();
    });
})
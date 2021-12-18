import {QueueType} from "./queue.interface";
import {QueueState} from "./queue-state.enum";
import {QueueItem} from "./queue-item.interface";
import {dispatchInQueue, DispatchInQueue} from "./dispatch-in-queue";
import {createQueueItem} from "./create-queue-item";
import {createRequestAction} from "../create-request-action";

describe('dispatchInQueue adds items to queue, dispatches, and sorts items', () => {
    let processFunction, queue: QueueType, dispatchFunction: DispatchInQueue, queueItems: QueueItem[];
    beforeEach(() => {
        const resolveMocks = [];
        const rejectMocks = [];
        queueItems = [];
        for (let i = 0; i < 3; i++) {
            resolveMocks.push(jest.fn());
            rejectMocks.push(jest.fn());
            const queueItem: QueueItem = createQueueItem(createRequestAction({type: `startAction${i}`}, {type: `endAction${i}`}), i) as QueueItem;
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
        dispatchFunction = dispatchInQueue(queue, processFunction);
    });

    it('adds queue item when dispatched, and adds missing properties',  () => {
        dispatchFunction(queueItems[0]);
        expect(queue.items.length).toBe(1);
        expect(queue.items[0].type).toBe(queueItems[0].type);
        expect(queue.items[0].promise.resolveActions).toBe(queueItems[0].promise.resolveActions);
        expect(queue.items[0].promise.rejectActions).toBe(queueItems[0].promise.rejectActions);
        expect(queue.items[0].priority).toBe(queueItems[0].priority);
        expect(queue.items[0].id).toBe(1);
        expect(queue.items[0].resolve).not.toBe(undefined);
        expect(queue.items[0].reject).not.toBe(undefined);
        expect('processingPromise' in queue.items[0]).toBe(true);
        expect(processFunction).toBeCalled();
    });

    it('adds queue items when dispatched at the end of the queue, and sorts them',  () => {
        dispatchFunction(queueItems[2]);
        dispatchFunction(queueItems[0]);
        dispatchFunction(queueItems[1]);
        expect(queue.items.length).toBe(3);
        expect(queue.items[0].startAction).toBe(queueItems[2].startAction);
        expect(queue.items[1].startAction).toBe(queueItems[1].startAction);
        expect(queue.items[2].startAction).toBe(queueItems[0].startAction);
    });
})
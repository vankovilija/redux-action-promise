import {QueueMemberItem, QueueType} from "./queue.interface";
import {createQueueItem} from "./create-queue-item";
import {createRequestAction} from "../create-request-action";
import {QueueItem} from "./queue-item.interface";
import {QueueState} from "./queue-state.enum";
import {findItemInQueue} from "./find-item-in-queue.util";

describe('findItemInQueue', () => {
    let queue: QueueType, queueItems: QueueMemberItem[];
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
            items: queueItems,
            state: QueueState.WAITING
        };
    })
    it('locates an item in a queue', () => {
        const item = findItemInQueue(queue, queueItems[1].id);
        expect(item).toBe(queueItems[1]);
    });
    it('returns null if no item is found', () => {
        const notFoundItem = findItemInQueue(queue, 54);
        expect(notFoundItem).toBe(null)
    })
})
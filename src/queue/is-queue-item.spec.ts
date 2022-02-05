import {createQueueItem} from "./create-queue-item";
import {createRequestAction} from "../create-request-action";
import {isQueueItem} from "./is-queue-item.util";

describe('isQueueItem',  () => {
    it('Checks if an item is a queue item', () => {
        const queueItem = createQueueItem(createRequestAction({type: 'test'}, {type: 'testResponse'}));
        expect(isQueueItem(queueItem)).toBe(true);
        const nonQueueItemRequest = createRequestAction({type: 'test2'}, {type: 'test2response'});
        expect(isQueueItem(nonQueueItemRequest)).toBe(false);
        const nonQueueItem = {type: 'test3'};
        expect(isQueueItem(nonQueueItem)).toBe(false);
    })
});
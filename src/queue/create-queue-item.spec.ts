import {createQueueItem} from "./create-queue-item";
import {createRequestAction} from "../create-request-action";
import {createAction} from "@reduxjs/toolkit";

describe('createQueueItem', () => {
    it('creates a queue item from a request action and adds priority', () => {
        const queueItem = createQueueItem(createRequestAction({type: 'test'}), 1);
        expect(queueItem.priority).toBe(1);
    });

    it('creates a queue item from a request action creator and adds priority', () => {
        const queueItemCreator = createQueueItem(createRequestAction(createAction('test')), 1);
        expect(queueItemCreator().priority).toBe(1);
    });
})
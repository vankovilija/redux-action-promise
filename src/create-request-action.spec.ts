import { createRequestAction } from './create-request-action';
import { createAction } from '@reduxjs/toolkit';

describe(
    'createRequestAction helper functionality for creating actions that will alter the behaviour of dispatch to return a promise',
    () => {
        it ('creates a action creator if an action creator is provided', () => {
            const actionCreator1 = createAction('testAction1');
            const actionType2 = 'testAction2';
            const requestActionCreator = createRequestAction(
                createAction<number>('testAction'),
                actionCreator1,
                actionType2,
                10
            );
            const resultingAction = requestActionCreator(1);
            expect('promise' in resultingAction).toBe(true);
            expect((resultingAction as any).promise.resolveActions).toBe(actionCreator1);
            expect((resultingAction as any).promise.rejectActions).toBe(actionType2);
            expect((resultingAction as any).promise.timeout).toBe(10);
            expect(resultingAction.payload).toBe(1);
        });
    });

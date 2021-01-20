import {createResponseAction} from './create-response-action';
import {createAction} from '@reduxjs/toolkit';

describe(
    'createResponseAction helper functionality for creating actions that will alter the behaviour of dispatch to return a promise',
    () => {
        it ('creates a action creator if an action creator is provided', () => {
            const actionCreator1 = createAction('testAction1');
            const actionType2 = 'testAction2';
            const responseActionCreator = createResponseAction(
                createAction<number>('testAction'),
                [actionCreator1],
                [actionType2],
                10
            );
            const resultingAction = responseActionCreator(1);
            expect('promise' in resultingAction).toBe(true);
            expect((resultingAction as any).promise.resolveActions[0]).toBe(actionCreator1);
            expect((resultingAction as any).promise.rejectActions[0]).toBe(actionType2);
            expect((resultingAction as any).promise.timeout).toBe(10);
        });
    });

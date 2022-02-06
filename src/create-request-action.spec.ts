import {createRequestAction, isRequestAction} from './create-request-action';
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

        describe('isRequestAction', () => {
            it ('checks if an action is a request action', () => {
                expect(isRequestAction(createRequestAction({type: 'a'}, {type: 'b'}) as any)).toBe(true);
            })

            it ('validates that redux actions are not request actions', () => {
                expect(isRequestAction({type: 'a'})).toBe(false);
            })

            it ('validates that strings are not request actions', () => {
                expect(isRequestAction('a' as any)).toBe(false);
            })

            it ('validates that null is not request actions', () => {
                expect(isRequestAction(null as any)).toBe(false);
            })

            it ('validates that resolveAction and rejectActions are present', () => {
                let action = createRequestAction({type: 'a'});
                delete action.promise.resolveActions;
                expect(isRequestAction(action)).toBe(false);
                action = createRequestAction({type: 'a'});
                delete action.promise.rejectActions;
                expect(isRequestAction(action)).toBe(false);
            })

            it ('validates that promise is an object and not null', () => {
                let action = createRequestAction({type: 'a'});
                action.promise = 12 as any;
                expect(isRequestAction(action)).toBe(false);
                action = createRequestAction({type: 'a'});
                action.promise = null;
                expect(isRequestAction(action)).toBe(false);
            })

            it('validates reject actions if resolveActions length is 0', () => {
                let action = createRequestAction({type: 'a'});
                action.promise.resolveActions = [];
                expect(isRequestAction(action)).toBe(true);
                action.promise.rejectActions = [];
                expect(isRequestAction(action)).toBe(true);
                action.promise.resolveActions = undefined;
                expect(isRequestAction(action)).toBe(true);
            })
        })
    });

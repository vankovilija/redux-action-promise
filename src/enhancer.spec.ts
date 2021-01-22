import { createStore } from 'redux';
import { ActionPromiseEnhancer } from './enhancer';
import { ActionPromiseStore } from './action-promise-store.interface';
import { createAction } from '@reduxjs/toolkit';
import { createResponseAction } from './create-response-action';

describe('ActionPromiseEnhancer', () => {
    let store: ActionPromiseStore;
    beforeEach(() => {
        store = createStore((store) => store, ActionPromiseEnhancer);
    });
    describe('subscribeToActions', () => {
        it ('calls the listener function of subscriptions', () => {
            const subscribeListener = jest.fn();
            const subscription = store.subscribeToActions(['testAction']);
            subscription.addListener(subscribeListener);
            const action = {
                type: 'testAction'
            };
            store.dispatch(action);
            expect(subscribeListener).toBeCalledWith(action);
        });

        it ('calls the multiple listener function of subscriptions', () => {
            const subscribeListener1 = jest.fn();
            const subscribeListener2 = jest.fn();
            const subscription = store.subscribeToActions(['testAction']);
            subscription.addListener(subscribeListener1);
            subscription.addListener(subscribeListener2);
            const action = {
                type: 'testAction'
            };
            store.dispatch(action);
            expect(subscribeListener1).toBeCalledWith(action);
            expect(subscribeListener2).toBeCalledWith(action);
        });

        it ('it does not call a listener after calling remove on it', () => {
            const subscribeListener1 = jest.fn();
            const subscribeListener2 = jest.fn();
            const subscription = store.subscribeToActions(['testAction']);
            subscription.addListener(subscribeListener1);
            const listener = subscription.addListener(subscribeListener2);
            listener.remove();
            const action = {
                type: 'testAction'
            };
            store.dispatch(action);
            expect(subscribeListener1).toBeCalledWith(action);
            expect(subscribeListener2).not.toBeCalled();
        });

        it ('does not execute listener when unsubscribe is called', () => {
            const subscribeListener = jest.fn();
            const subscription = store.subscribeToActions(['testAction']);
            subscription.addListener(subscribeListener);
            const action = {
                type: 'testAction'
            };
            subscription.unsubscribe();
            store.dispatch(action);
            expect(subscribeListener).not.toBeCalled();
        });

        it ('rejects requests to do a subscription without any actions', () => {
            expect(() => store.subscribeToActions([])).toThrowError('actions must be a non-empty array');
        });

        it ('rejects requests to do a subscription with duplicated actions', () => {
            expect(() => store.subscribeToActions(['testAction', 'testAction'])).toThrowError('Action \'testAction\' is duplicated');
        });
    });
    describe('promise', () => {
        it('exposes a method to create a promise', () => {
            expect(typeof store.promise === 'function').toBeTruthy();
        });
        it('returns a promise when the promise method is called', () => {
            const p = store.promise(['testAction']);
            expect(typeof p.then === 'function').toBeTruthy();
            expect(typeof p.catch === 'function').toBeTruthy();
        });
        it ('resolves the promise when the proper action is dispatched', () => {
            const p = store.promise(['testAction']);
            const action = {
                type: 'testAction'
            };
            store.dispatch(action);
            return expect(p).resolves.toEqual(action);
        });
        it ('does not resolve canceled promises when the action is dispatched', () => {
            const p = store.promise(['testAction']);
            const action = {
                type: 'testAction'
            };
            const mockThen = jest.fn();
            p.then(mockThen);
            p.cancel();
            store.dispatch(action);
            return expect(mockThen).not.toBeCalled();
        });
        it ('rejects the promise when the proper action is dispatched', async () => {
            const p = store.promise([], ['testAction']);
            const action = {
                type: 'testAction'
            };
            store.dispatch(action);
            await expect(p).rejects.toThrowError('Rejected action testAction');
            return expect(p).rejects.toHaveProperty('rejectAction', action)
        });
        it ('rejects requests to do a promise with duplicated resolve actions', () => {
            expect(() => store.promise(['testAction', 'testAction'])).toThrowError('Resolve action \'testAction\' is duplicated');
        });
        it ('rejects requests to do a promise with duplicated reject actions', () => {
            expect(() => store.promise([], ['testAction', 'testAction'])).toThrowError('Reject action \'testAction\' is duplicated');
        });
        it ('rejects requests to do a promise with duplicated actions across reject/resolve', () => {
            expect(() => store.promise(['testAction'], ['testAction1', 'testAction'])).toThrowError('Action \'testAction\' is present in resolve and reject actions');
        });
        it ('rejects requests to do a promise without any actions', () => {
            expect(() => store.promise([])).toThrowError('One of the resolve or reject actions array must contain elements');
        });
        it ('times out if a timeout is specified', async () => {
            const p = store.promise(['testAction'], [], 100);
            const action = {
                type: 'testAction'
            };
            setTimeout(() => {
                store.dispatch(action);
            }, 150);
            // @ts-ignore
            await expect(p).rejects.toHaveProperty('name', 'TimeoutError');
            return expect(p).rejects.toHaveProperty('message', 'Timed out promise')
        });
    });
    describe('dispatch', () => {
        it ('returns the dispatched action when the action is a normal action',  () => {
            const actionCreator = createAction('testAction');
            const action = actionCreator();
            const returnValue = store.dispatch(action);
            expect(returnValue).toBe(action);
        });

        it ('returns and resolve a promise from dispatching a response action with the response', () => {
            const responseActionCreator = createAction('testActionResponse');
            const actionCreator = createResponseAction(createAction('testAction'), responseActionCreator);

            const response = store.dispatch(actionCreator());

            const responseAction = responseActionCreator();
            store.dispatch(responseAction);

            return expect(response).resolves.toBe(responseAction);
        });

        it ('rejects a promise returned from dispatch with a error containing the reject action', () => {
            const rejectActionCreator = createAction('testActionReject');
            const actionCreator = createResponseAction(createAction('testAction'), undefined, rejectActionCreator);

            const response = store.dispatch(actionCreator());

            const rejectAction = rejectActionCreator();
            store.dispatch(rejectAction);

            return expect(response).rejects.toHaveProperty('rejectAction', rejectAction);
        });
    });
});

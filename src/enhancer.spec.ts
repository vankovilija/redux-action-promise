import {createStore} from 'redux';
import { ActionPromiseEnhancer } from './enhancer';
import { ActionPromiseStore } from './action-promise-store.interface';
import {createAction} from '@reduxjs/toolkit';
import { createRequestAction } from './create-request-action';

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

        it ('returns and resolve a promise from dispatching a request action with the response', () => {
            const responseActionCreator = createAction('testActionResponse');
            const actionCreator = createRequestAction(createAction('testAction'), responseActionCreator);
            const response = store.dispatch(actionCreator());

            const responseAction = responseActionCreator();
            store.dispatch(responseAction);

            return expect(response).resolves.toBe(responseAction);
        });

        it ('rejects a promise returned from dispatch with a error containing the reject action', () => {
            const rejectActionCreator = createAction('testActionReject');
            const requestActionCreator = createRequestAction(createAction('testAction'), undefined, rejectActionCreator);

            const response = store.dispatch(requestActionCreator());

            const rejectAction = rejectActionCreator();
            store.dispatch(rejectAction);

            return expect(response).rejects.toHaveProperty('rejectAction', rejectAction);
        });
    });
    describe('createActionsQueue', () => {
        it('returns an actions queue when called', () => {
            const queue = store.createActionQueue();
            expect(typeof queue.dispatch).toBe('function');
            expect(typeof queue.pauseQueue).toBe('function');
            expect(typeof queue.resumeQueue).toBe('function');
        });

        it('queues actions when dispatched from queue', async () => {
            const queue = store.createActionQueue();
            const startAction = {type: 'startAction'};
            const endAction = {type: 'endAction'};
            const afterAction = {type: 'afterAction'};

            const promise = queue.dispatch(startAction, endAction);
            queue.dispatch(afterAction);
            const afterActionSubscriber = store.subscribeToActions(afterAction);
            const afterActionFinishedCallback = jest.fn();
            afterActionSubscriber.addListener(afterActionFinishedCallback)
            expect(afterActionFinishedCallback).not.toBeCalled();
            store.dispatch(endAction);
            await promise;
            expect(afterActionFinishedCallback).toBeCalled();
        });

        it('it will not consider end actions prior to starting work on a given action', async () => {
            const queue = store.createActionQueue();
            const startAction1 = {type: 'startAction1'};
            const endAction1 = {type: 'endAction1'};
            const startAction2 = {type: 'startAction2'};
            const endAction2 = {type: 'endAction2'};
            const afterAction = {type: 'afterAction'};

            const promise1 = queue.dispatch(startAction1, endAction1);
            const promise2 = queue.dispatch(startAction2, endAction2);
            queue.dispatch(afterAction);
            const afterActionSubscriber = store.subscribeToActions(afterAction);
            const afterActionFinishedCallback = jest.fn();
            afterActionSubscriber.addListener(afterActionFinishedCallback)
            expect(afterActionFinishedCallback).not.toBeCalled();
            store.dispatch(endAction2); // dispatched prior to action 1 finishing
            store.dispatch(endAction1);
            await promise1;
            expect(afterActionFinishedCallback).not.toBeCalled();
            store.dispatch(endAction2);
            await promise2;
            expect(afterActionFinishedCallback).toBeCalled();
        });

        it('supports multiple queues in parallel', async () => {
            const queue1 = store.createActionQueue();
            const startAction1 = {type: 'startAction1'};
            const endAction1 = {type: 'endAction1'};
            const afterAction1 = {type: 'afterAction1'};

            const queue2 = store.createActionQueue();
            const startAction2 = {type: 'startAction2'};
            const endAction2 = {type: 'endAction2'};
            const afterAction2 = {type: 'afterAction2'};

            const promise1 = queue1.dispatch(startAction1, endAction1);
            queue1.dispatch(afterAction1);
            const promise2 = queue2.dispatch(startAction2, endAction2);
            queue2.dispatch(afterAction2);
            const afterActionSubscriber1 = store.subscribeToActions(afterAction1);
            const afterActionFinishedCallback1 = jest.fn();
            const afterActionSubscriber2 = store.subscribeToActions(afterAction2);
            const afterActionFinishedCallback2 = jest.fn();
            afterActionSubscriber1.addListener(afterActionFinishedCallback1)
            afterActionSubscriber2.addListener(afterActionFinishedCallback2)
            expect(afterActionFinishedCallback1).not.toBeCalled();
            expect(afterActionFinishedCallback2).not.toBeCalled();
            store.dispatch(endAction1);
            await promise1;
            expect(afterActionFinishedCallback2).not.toBeCalled();
            expect(afterActionFinishedCallback1).toBeCalled();
            store.dispatch(endAction2);
            await promise2;
            expect(afterActionFinishedCallback2).toBeCalled();
        });

        it('can be canceled', async () => {
            const queue = store.createActionQueue();
            const startAction = {type: 'startAction'};
            const endAction = {type: 'endAction'};
            const afterAction = {type: 'afterAction'};

            const promise = queue.dispatch(startAction, endAction);
            queue.dispatch(afterAction);
            const afterActionSubscriber = store.subscribeToActions(afterAction);
            const afterActionFinishedCallback = jest.fn();
            afterActionSubscriber.addListener(afterActionFinishedCallback)
            expect(afterActionFinishedCallback).not.toBeCalled();
            promise.cancel();
            expect(afterActionFinishedCallback).toBeCalled();
        });

        it('can be paused and resumed', async () => {
            const queue = store.createActionQueue();
            const startAction = {type: 'startAction'};
            const endAction = {type: 'endAction'};
            const afterAction = {type: 'afterAction'};

            const promise = queue.dispatch(startAction, endAction);
            queue.dispatch(afterAction);
            queue.pauseQueue();
            const afterActionSubscriber = store.subscribeToActions(afterAction);
            const afterActionFinishedCallback = jest.fn();
            afterActionSubscriber.addListener(afterActionFinishedCallback)
            expect(afterActionFinishedCallback).not.toBeCalled();
            store.dispatch(endAction);
            await promise;
            expect(afterActionFinishedCallback).not.toBeCalled();
            queue.resumeQueue();
            expect(afterActionFinishedCallback).toBeCalled();
        });

        it('works with request action and action creator', async () => {
            const queue = store.createActionQueue();
            const startAction = createAction('startAction');
            const endAction = createAction('endAction');
            const afterAction = createAction('afterAction');
            const startActionPromise = queue.dispatch(createRequestAction(startAction, endAction)());
            queue.dispatch(afterAction);

            const afterActionSubscriber = store.subscribeToActions(afterAction);
            const afterActionFinishedCallback = jest.fn();
            afterActionSubscriber.addListener(afterActionFinishedCallback)
            expect(afterActionFinishedCallback).not.toBeCalled();
            store.dispatch(endAction());
            await startActionPromise;
            expect(afterActionFinishedCallback).toBeCalled();
        });

        it('respects action priority', async () => {
            const queue = store.createActionQueue();
            const startAction1 = {type: 'startAction1'};
            const startAction2 = {type: 'startAction2'};
            const startAction3 = {type: 'startAction3'};
            const startAction4 = {type: 'startAction4'};
            const endAction1 = {type: 'endAction1'};
            const endAction2 = {type: 'endAction2'};
            const endAction3 = {type: 'endAction3'};
            const endAction4 = {type: 'endAction4'};
            const afterAction = {type: 'afterAction'};

            const startActionSubscriber1 = store.subscribeToActions(startAction1);
            const endActionSubscriber1 = store.subscribeToActions(endAction1);
            const startActionSubscriber2 = store.subscribeToActions(startAction2);
            const endActionSubscriber2 = store.subscribeToActions(endAction2);
            const startActionSubscriber3 = store.subscribeToActions(startAction3);
            const endActionSubscriber3 = store.subscribeToActions(endAction3);
            const startActionSubscriber4 = store.subscribeToActions(startAction4);
            const endActionSubscriber4 = store.subscribeToActions(endAction4);
            const afterActionSubscriber = store.subscribeToActions(afterAction);
            const startActionCallback1 = jest.fn();
            const startActionCallback2 = jest.fn();
            const startActionCallback3 = jest.fn();
            const startActionCallback4 = jest.fn();
            const endActionCallback1 = jest.fn();
            const endActionCallback2 = jest.fn();
            const endActionCallback3 = jest.fn();
            const endActionCallback4 = jest.fn();
            const afterActionFinishedCallback = jest.fn();
            startActionSubscriber1.addListener(startActionCallback1)
            expect(startActionCallback1).not.toBeCalled();
            endActionSubscriber1.addListener(endActionCallback1)
            expect(endActionCallback1).not.toBeCalled();
            startActionSubscriber2.addListener(startActionCallback2)
            expect(startActionCallback2).not.toBeCalled();
            endActionSubscriber2.addListener(endActionCallback2)
            expect(endActionCallback2).not.toBeCalled();
            startActionSubscriber3.addListener(startActionCallback3)
            expect(startActionCallback3).not.toBeCalled();
            endActionSubscriber3.addListener(endActionCallback3)
            expect(endActionCallback3).not.toBeCalled();
            startActionSubscriber4.addListener(startActionCallback4)
            expect(startActionCallback4).not.toBeCalled();
            endActionSubscriber4.addListener(endActionCallback4)
            expect(endActionCallback4).not.toBeCalled();
            afterActionSubscriber.addListener(afterActionFinishedCallback)
            expect(afterActionFinishedCallback).not.toBeCalled();

            const promise1 = queue.dispatch(startAction1, endAction1, undefined, 4);
            const promise4 = queue.dispatch(startAction4, endAction4, undefined, 1);
            const promise2 = queue.dispatch(startAction2, endAction2, undefined, 3);
            const promise3 = queue.dispatch(startAction3, endAction3, undefined, 2);
            queue.dispatch(afterAction);

            expect(startActionCallback1).toBeCalled();

            store.dispatch(endAction1);
            await promise1;
            expect(endActionCallback1).toBeCalled();
            expect(startActionCallback2).toBeCalled();
            expect(startActionCallback3).not.toBeCalled();
            expect(startActionCallback4).not.toBeCalled();
            expect(afterActionFinishedCallback).not.toBeCalled();

            store.dispatch(endAction2);
            await promise2;
            expect(endActionCallback2).toBeCalled();
            expect(startActionCallback3).toBeCalled();
            expect(startActionCallback4).not.toBeCalled();
            expect(afterActionFinishedCallback).not.toBeCalled();

            store.dispatch(endAction3);
            await promise3;
            expect(endActionCallback3).toBeCalled();
            expect(startActionCallback4).toBeCalled();
            expect(afterActionFinishedCallback).not.toBeCalled();

            store.dispatch(endAction4);
            await promise4;
            expect(endActionCallback4).toBeCalled();
            expect(afterActionFinishedCallback).toBeCalled();
        });
    });
});

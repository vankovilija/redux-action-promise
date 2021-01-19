import { Action, StoreEnhancer } from 'redux';
import { mustBeFunction } from './must-be-function.util';
import { EnhancedMethods } from './action-promise-store.interface';
import { subscribeToActions } from './subscribe-to-actions';
import { promise } from './promise';
import { invariant } from './invariant.util';
import { processAction } from './process-action';

export type ActiveSubscriptionsIndex = {[action: string]: ((action: Action) => void)[][]}

export enum ValidationMode {
    RUNTIME = 'runtime',
    COMPILETIME = 'compiletime'
}

let validationMode: ValidationMode;
let isExecuted = false;

export const ActionPromiseEnhancer: StoreEnhancer<EnhancedMethods> & {validationMode: ValidationMode} = (createStore) => {
    isExecuted = true;
    if (ActionPromiseEnhancer.validationMode === ValidationMode.RUNTIME) {
        mustBeFunction(createStore, 'createStore');
    }
    return (...args) => {
        const store = createStore(...args);

        const activeSubscriptionsIndex: ActiveSubscriptionsIndex = {};

        const dispatch = (action) => {
            processAction(activeSubscriptionsIndex, action);
            return store.dispatch(action);
        };

        const subscriber = subscribeToActions(ActionPromiseEnhancer.validationMode, activeSubscriptionsIndex);

        const promiseFunction = promise(ActionPromiseEnhancer.validationMode, subscriber);

        return {
            ...store,
            dispatch,
            /**
             * The promise function is used to generate a promise that resolves or rejects when any of a given list of actions
             * is dispatched on the target store.
             *
             * @param {Array.<number|string|function>} resolveActions is an array of action types or action creators, when any
             * of these is dispatched to the store the promise will be resolved.
             *
             * @param {Array.<number|string|function>} rejectActions is an array of action types or action creators, when any of
             * these is dispatched to the store the promise will be rejected.
             *
             * @param timeout is the number of ms that will timeout this promise and cause it to reject with a TimeoutError
             *
             * @returns {Promise.<Action>} resolves with the action that is dispatches, or rejects with an error that contains
             * that action that is dispatched in a `rejectAction` property of the error object
             */
            promise: promiseFunction,
            /**
             * subscribeToActions is used to generate a subscription object that calls attached listeners whenever any of the
             * actions specified in the subscription are dispatched to the store.
             *
             * @param {Array.<number|string|function>} actions is an array of action types or action creates, when any of these
             * are dispatched to the store, the listener callback functions attached to the returned subscription will be called
             * with the action that is dispatched.
             *
             * @returns {Subscription} an object with 2 methods
             *     - addListener allows you to add a callback function to the subscription that will be executed when any of the
             *     actions provided are dispatched to the store.
             *     - unsubscribe allows you to remove the subscription when no longer in use.
             */
            subscribeToActions: subscriber
        }
    }
};

Object.defineProperty(ActionPromiseEnhancer, 'validationMode', {
    get: () => {
        return validationMode;
    },
    set: (v: ValidationMode) => {
        invariant(!isExecuted, 'Can only set validationMode before using the ActionPromiseEnhancer');
        validationMode = v;
    }
});

ActionPromiseEnhancer.validationMode = ValidationMode.RUNTIME;

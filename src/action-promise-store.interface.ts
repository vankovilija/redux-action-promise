import { Action, AnyAction, Store } from 'redux';
import { Subscription } from './subscription.interface';

export type ActionCreatorType<A extends Action = AnyAction> =
    (payload?: any, ...args: any[]) => A;

export type SubscriberFunction<A extends Action = AnyAction> =
    (actions: (string | number | AnyAction | ActionCreatorType<A>)[]) => Subscription;

export type PromiseAction<A extends Action = AnyAction> =
    A & { promise: {
        resolveActions?: (string | number | AnyAction | ActionCreatorType<A>)[],
        rejectActions?: (string | number | AnyAction | ActionCreatorType<A>)[],
        timeout?: number
    }};

export type PromiseFunction<A extends Action = AnyAction> =
    (
        resolveActions: (string | number | AnyAction | ActionCreatorType<A>)[],
        rejectActions?: (string | number | AnyAction | ActionCreatorType<A>)[],
        timeout?: number
    ) => Promise<A> & {cancel: () => void};

export interface DispatchFunction<A extends Action = AnyAction> {
    <T extends A>(action: T): (T | (Promise<AnyAction> & {cancel: () => void}))
}

export type EnhancedMethods<S = any, A extends Action = AnyAction> = {

    dispatch: DispatchFunction<A>

    /**
     * The promise function is used to generate a promise that resolves or rejects when any of a given list of actions
     * is dispatched on the target store.
     *
     * @param {Array.<number|string|Action|function>} resolveActions is an array of action types, actions or action
     * creators, when any of these are dispatched to the store the promise will be resolved.
     *
     * @param {Array.<number|string|Action|function>} rejectActions is an array of action types, actions or action
     * creators, when any of these are dispatched to the store the promise will be rejected.
     *
     * @param timeout is the number of ms that will timeout this promise and cause it to reject with a TimeoutError
     *
     * @returns {Promise.<Action>} resolves with the action that is dispatches, or rejects with an error that contains
     * that action that is dispatched in a `rejectAction` property of the error object
     */

    promise: PromiseFunction<A>

    /**
     * subscribeToActions is used to generate a subscription object that calls attached listeners whenever any of the
     * actions specified in the subscription are dispatched to the store.
     *
     * @param {Array.<number|string|Action|function>} actions is an array of action types or action creates, when any of these
     * are dispatched to the store, the listener callback functions attached to the returned subscription will be called
     * with the action that is dispatched.
     *
     * @returns {Subscription} an object with 2 methods
     *     - addListener allows you to add a callback function to the subscription that will be executed when any of the
     *     actions provided are dispatched to the store.
     *     - unsubscribe allows you to remove the subscription when no longer in use.
     */

    subscribeToActions: SubscriberFunction<A>
}

export type ActionPromiseStore<S = any, A extends Action = AnyAction> =
    Store<S, A> & EnhancedMethods<S, A>

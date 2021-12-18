import { Action, AnyAction, Store } from 'redux';
import { Subscription } from './subscription.interface';
import {CreateActionQueue} from "./queue/create-action-queue";

export type ActionCreatorType<A extends Action = AnyAction> =
    (payload?: any, ...args: any[]) => A;

export type AnyTypeOfAction<A extends Action = AnyAction> = string | number | A | ActionCreatorType<A>

export type ArrayOrSingleAnyTypeOfAction<A extends Action = AnyAction> = AnyTypeOfAction<A> | AnyTypeOfAction<A>[];

export type SubscriberFunction<A extends Action = AnyAction> =
    (actions: ArrayOrSingleAnyTypeOfAction) => Subscription;

export type RequestAction<A extends Action = AnyAction> =
    A & { promise: {
        resolveActions?: ArrayOrSingleAnyTypeOfAction<A>,
        rejectActions?: ArrayOrSingleAnyTypeOfAction<A>,
        timeout?: number
    }};

export type CancelablePromise<A extends Action = AnyAction> = Promise<A> & {cancel: () => void}

export type PromiseFunction<A extends Action = AnyAction> =
    (
        resolveActions: ArrayOrSingleAnyTypeOfAction<A>,
        rejectActions?: ArrayOrSingleAnyTypeOfAction<A>,
        timeout?: number
    ) => CancelablePromise<A>;

export interface DispatchFunction<A extends Action = AnyAction> {
    <T extends A>(action: T): (T | (Promise<AnyAction> & {cancel: () => void}))
}

export type EnhancedMethods<S = any, A extends Action = AnyAction> = {
    /**
     * The enhanced dispatch function alters its return value depending on the input. If an action is used that contains
     * a property called `promise` and that property in its self is a object, the dispatch function will look for one or
     * more of the properties `resolveActions`, `rejectActions` and `timeout` on the promise object and use them to create
     * a promise on the store object that will be returned from the dispatch.
     *
     * There is a helper method to generate these sort of actions from a action generator function or an action object
     * please look up `createRequestAction`
     *
     * @param {Action} action
     *
     * @returns {Action | Promise<Action>} either returns the action that was dispatched, if it is not a request action,
     * or a promise that resolves with an action, if it is a request action.
     */

    dispatch: DispatchFunction<A>

    /**
     * The promise function is used to generate a promise that resolves or rejects when any of a given list of actions
     * is dispatched on the target store.
     *
     * @param {number|string|Action|Action|ActionCreator<Action> | Array.<number|string|Action|Action|ActionCreator<Action>>}
     * resolveActions is an array of action types, actions or action creators, when any of these are dispatched to the
     * store the promise will be resolved.
     *
     * @param {number|string|Action|Action|ActionCreator<Action> | Array.<number|string|Action|Action|ActionCreator<Action>>}
     * rejectActions is an array of action types, actions or action creators, when any of these are dispatched to the
     * store the promise will be rejected.
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
     * @param {number|string|Action|Action|ActionCreator<Action> | Array.<number|string|Action|Action|ActionCreator<Action>>}
     * actions is an array of action types or action creates, when any of these are dispatched to the store, the listener
     * callback functions attached to the returned subscription will be called with the action that is dispatched.
     *
     * @returns {Subscription} an object with 2 methods
     *     - addListener allows you to add a callback function to the subscription that will be executed when any of the
     *     actions provided are dispatched to the store.
     *     - unsubscribe allows you to remove the subscription when no longer in use.
     */

    subscribeToActions: SubscriberFunction<A>

    /**
     * createActionQueue is used to create a queue that dispatches actions sequentially, if an end action is provided, or
     * if the provided action is a request action, than the queue is progressed after the end action is executed.
     *
     * @returns {ActionQueue} an object with 3 methods
     *     - dispatch a delegated version of the regular dispatch method, this will dispatch the action if the queue is
     *     empty, or append the action to the queue, and dispatch it when it is ready. The method returns a promise that
     *     resolves / rejects when the given action is executed, you can remove the action from the queue by cancelling
     *     that promise.
     *     - pauseQueue sets the state of the queue to paused, causing the queue to stop execution on further actions in
     *     the queue, until resumed.
     *     - resumeQueue resumes the queue and sets the state to either ACTIVE or WAITING, continuing with execution of
     *     actions in the queue, if the queue is not empty.
     */
    
    createActionQueue: CreateActionQueue<A>
}

export type ActionPromiseStore<S = any, A extends Action = AnyAction> =
    Store<S, A> & EnhancedMethods<S, A>

import { processAction } from './process-action';
import { ActiveSubscriptionsIndex } from './enhancer';
import { Action, AnyAction, Dispatch } from 'redux';
import { DispatchFunction, PromiseAction, PromiseFunction } from './action-promise-store.interface';

function isPromiseAction<A extends Action = AnyAction>(action: A | PromiseAction<A>): action is PromiseAction<A> {
    return typeof action === 'object' && action !== null && 'promise' in action && typeof action.promise === 'object' && action.promise !== null;
}

export const dispatch = <A extends Action = AnyAction>(
    activeSubscriptionsIndex: ActiveSubscriptionsIndex,
    promise: PromiseFunction,
    dispatchFunction: Dispatch<A>
): DispatchFunction<A> => (
    /**
     * The enhanced dispatch function alters its return value depending on the input. If an action is used that contains
     * a property called `promise` and that property in its self is a object, the dispatch function will look for one or
     * more of the properties `resolveActions`, `rejectActions` and `timeout` on the promise object and use them to create
     * a promise on the store object that will be returned from the dispatch.
     *
     * There is a helper method to generate these sort of actions from a action generator function or an action object
     * please look up `createResponseAction`
     *
     * @param {Action} action
     *
     * @returns {Action | Promise<Action>} either returns the action that was dispatched, if it is not a response
     * action, or a promise that resolves with an action, if it is a response action.
     */
    (action: A) => {
    let toReturn: any = dispatchFunction(action);
    if (isPromiseAction(action)) {
        toReturn = promise(action.promise.resolveActions || [], action.promise.rejectActions, action.promise.timeout);
    }
    processAction(activeSubscriptionsIndex, action);
    return toReturn;
}) as any;
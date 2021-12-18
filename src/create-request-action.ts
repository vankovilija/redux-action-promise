import { Action, AnyAction } from 'redux';
import {ActionCreatorType, ArrayOrSingleAnyTypeOfAction, RequestAction} from './action-promise-store.interface';
import { isActionCreator } from './subscribe-to-actions/is-action-creator.util';
import {isArray} from "./is-array.util";

export function isRequestAction<A extends Action = AnyAction>(action: A | RequestAction<A>): action is RequestAction<A> {
    return typeof action === 'object' && action !== null && 'promise' in action && typeof action.promise === 'object' && action.promise !== null
        && (((isArray(action.promise.resolveActions) && action.promise.resolveActions.length > 0) || action.promise.resolveActions !== undefined)
        || ((isArray(action.promise.rejectActions) && action.promise.rejectActions.length > 0) || action.promise.rejectActions !== undefined));
}

const requestActionGenerator = (actionObject, responseActions, errorActions, timeout) => {
    return Object.assign({}, actionObject, {
        promise: {
            resolveActions: responseActions,
            rejectActions: errorActions,
            timeout: timeout
        }
    }) as AnyAction
};

type ReturnType<T, A extends Action = AnyAction> =
    T extends ActionCreatorType ? ActionCreatorType<RequestAction<A>> :
        T extends Action ? RequestAction<A> :
            never;

/**
 * A function that wraps your action object or action creator function to generate a action or action creator that has
 * a special data set that when dispatched will generate a promise that will resolve when any of the responseActions
 * provided are dispatched afterwards or reject when any of the errorActions are dispatched.
 *
 * @param {AnyAction | ActionCreatorType<AnyAction>} action an action or action creator to wrap
 * @param {Array.<string | number | AnyAction | ActionCreatorType<AnyAction>>} responseActions actions to resolve the
 * promise with when this is dispatched
 * @param {Array.<string | number | AnyAction | ActionCreatorType<AnyAction>>} errorActions actions to reject the promise
 * with when this is dispatched
 * @param {number} timeout number of ms to wait for a response or reject action, after which the promise is rejected with
 * a timeout.
 *
 * @returns {AnyAction | ActionCreatorType<AnyAction>} an action or action creator depending on the parameter provided
 * to the function.
 */

export const createRequestAction = <T extends (A | ActionCreatorType<A>), A extends Action = AnyAction>(
    action: T,
    responseActions?: ArrayOrSingleAnyTypeOfAction,
    errorActions?: ArrayOrSingleAnyTypeOfAction,
    timeout?: number
): ReturnType<T, A> => {

    if (isActionCreator(action)) {
        return ((...args) => {
            const actionObject = action(...args);
            return requestActionGenerator(actionObject, responseActions, errorActions, timeout);
        }) as ReturnType<T, A>;
    }
    return requestActionGenerator(action, responseActions, errorActions, timeout) as any;
};

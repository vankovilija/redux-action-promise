import { Action, AnyAction } from 'redux';
import { ActionCreatorType, ArrayOrSingleAnyTypeOfAction } from './action-promise-store.interface';
import { isActionCreator } from './subscribe-to-actions/is-action-creator.util';

const responseActionGenerator = (actionObject, responseActions, errorActions, timeout) => {
    return Object.assign({}, actionObject, {
        promise: {
            resolveActions: responseActions,
            rejectActions: errorActions,
            timeout: timeout
        }
    }) as AnyAction
};

/**
 * A function that wraps your action object or action creator function to generate a action or action creator that has
 * a special data set that when dispatched will generate a promise that will resolve when any of the responseActions
 * provided are dispatched afterwards or reject when any of the errorActions are dispatched.
 *
 * @param {AnyAction | ActionCreator<AnyAction>} action an action or action creator to wrap
 * @param {Array.<string | number | AnyAction | ActionCreator<AnyAction>>} responseActions actions to resolve the
 * promise with when this is dispatched
 * @param {Array.<string | number | AnyAction | ActionCreator<AnyAction>>} errorActions actions to reject the promise
 * with when this is dispatched
 * @param {number} timeout number of ms to wait for a response or reject action, after which the promise is rejected with
 * a timeout.
 *
 * @returns {AnyAction | ActionCreatorType<AnyAction>} an action or action creator depending on the parameter provided
 * to the function.
 */

export const createResponseAction = <T extends (AnyAction | ActionCreatorType<A>), A extends Action = AnyAction>(
    action?: T,
    responseActions?: ArrayOrSingleAnyTypeOfAction<A>,
    errorActions?: ArrayOrSingleAnyTypeOfAction<A>,
    timeout?: number
): T => {

    if (isActionCreator(action)) {
        return ((...args) => {
            const actionObject = action(...args);
            return responseActionGenerator(actionObject, responseActions, errorActions, timeout);
        }) as unknown as T;
    }
    return responseActionGenerator(action, responseActions, errorActions, timeout) as any;
};

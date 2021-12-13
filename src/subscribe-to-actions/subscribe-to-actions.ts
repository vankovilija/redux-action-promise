import { Subscription } from '../subscription.interface';
import { mustBeNonEmptyArray } from '../must-be-non-empty-array.util';
import { mustBeUniqueArray } from '../must-be-unique-array.util';
import { ActiveSubscriptionsIndex, ValidationMode } from '../enhancer';
import { subscribe as subscribeFactory } from './subscribe';
import { unsubscribe as unsubscribeFactory } from './unsubscribe';
import { addListener as addListenerFactory } from './add-listener';
import { ActionCreatorType } from '../action-promise-store.interface';
import { AnyAction } from 'redux';
import { convertToArray } from '../convert-to-array.util';
import {convertActionsToActionTypes} from "../convert-actions-to-action-types.util";

export const subscribeToActions = (validationMode: ValidationMode, activeSubscriptionsIndex: ActiveSubscriptionsIndex) =>
    /**
     * subscribeToActions is used to generate a subscription object that calls attached listeners whenever any of the
     * actions specified in the subscription are dispatched to the store.
     *
     * @param {number|string|Action|ActionCreator<Action> | Array.<number|string|Action|ActionCreator<Action>>} actions is an array of action types or action creates, when any of these
     * are dispatched to the store, the listener callback functions attached to the returned subscription will be called
     * with the action that is dispatched.
     *
     * @returns {Subscription} an object with 2 methods
     *     - addListener allows you to add a callback function to the subscription that will be executed when any of the
     *     actions provided are dispatched to the store.
     *     - unsubscribe allows you to remove the subscription when no longer in use.
     */
    (actions: (string | number | ActionCreatorType | AnyAction)[]): Subscription => {
    const processedActions = convertToArray(actions);
    if (validationMode === ValidationMode.RUNTIME) {
        mustBeNonEmptyArray(processedActions, 'actions');
        mustBeUniqueArray(processedActions, (item) => `Action '${item}' is duplicated`);
    }

    const listeners = [];
    let subscriptionState = {active: false};

    const mappedActions = convertActionsToActionTypes(processedActions);

    if (validationMode === ValidationMode.RUNTIME) {
        mustBeUniqueArray(mappedActions, (item) => `Action type '${item}' is duplicated among the provided actions`);
    }

    const subscribe = subscribeFactory(subscriptionState, mappedActions, activeSubscriptionsIndex, listeners);

    const unsubscribe = unsubscribeFactory(subscriptionState, mappedActions, activeSubscriptionsIndex, listeners);

    const addListener = addListenerFactory(subscriptionState, subscribe, unsubscribe, listeners);

    return {
        addListener,
        /**
         * Removes the subscription from the store.
         */
        unsubscribe
    };
};

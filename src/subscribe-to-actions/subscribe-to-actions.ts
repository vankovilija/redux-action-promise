import { Subscription } from '../subscription.interface';
import { mustBeNonEmptyArray } from '../must-be-non-empty-array.util';
import { mustBeUniqueArray } from '../must-be-unique-array.util';
import { ActiveSubscriptionsIndex, ValidationMode } from '../enhancer';
import { subscribe as subscribeFactory } from './subscribe';
import { unsubscribe as unsubscribeFactory } from './unsubscribe';
import { addListener as addListenerFactory } from './add-listener';
import { isActionCreator } from './is-action-creator.util';
import { isActionObject } from './is-action-object.util';
import { ActionCreatorType } from '../action-promise-store.interface';
import { AnyAction } from 'redux';

export const subscribeToActions = (validationMode: ValidationMode, activeSubscriptionsIndex: ActiveSubscriptionsIndex) =>
    (actions: (string | number | ActionCreatorType | AnyAction)[]): Subscription => {
    if (validationMode === ValidationMode.RUNTIME) {
        mustBeNonEmptyArray(actions, 'actions');
        mustBeUniqueArray(actions, (item) => `Action '${item}' is duplicated`);
    }

    const listeners = [];
    let subscriptionState = {active: false};

    const mappedActions = actions.map((action) => {
        if (isActionCreator(action)) {
            const executedAction = action();
            return executedAction.type;
        } else if (isActionObject(action)) {
            return action.type;
        }
        return action;
    });

    if (validationMode === ValidationMode.RUNTIME) {
        mustBeUniqueArray(mappedActions, (item) => `Action type '${item}' is duplicated among the provided actions`);
    }

    const subscribe = subscribeFactory(subscriptionState, mappedActions, activeSubscriptionsIndex, listeners);

    const unsubscribe = unsubscribeFactory(subscriptionState, mappedActions, activeSubscriptionsIndex, listeners);

    const addListener = addListenerFactory(subscriptionState, subscribe, unsubscribe, listeners);

    return {
        /**
         * Adds a listener callback function to the subscription that will be called when any of the actions associated to
         * the subscription are dispatched on the store.
         *
         * @param {Function} callback is a function with one parameter, which is the action that was executed
         *
         * @returns {Listener} an object with a remove method that allows you to remove the added listener callback function
         * from the subscription
         */
        addListener,
        /**
         * Removes the subscription from the store.
         */
        unsubscribe
    };
};

import { Action } from 'redux';
import { removeListener } from './remove-listener';

export const addListener = (
    subscriptionState: {active: boolean},
    subscribe: () => void, unsubscribe: () => void,
    listeners: ((action: Action) => void)[]
): (callback: (action: Action) => void) => {remove: () => void} =>
    /**
     * Adds a listener callback function to the subscription that will be called when any of the actions associated to
     * the subscription are dispatched on the store.
     *
     * @param {Function} callback is a function with one parameter, which is the action that was executed
     *
     * @returns {Listener} an object with a remove method that allows you to remove the added listener callback function
     * from the subscription
     */
    (callback: (action: Action) => void) => {
    if (!subscriptionState.active) {
        subscribe();
    }

    listeners.push(callback);

    const remove = removeListener(subscriptionState, unsubscribe, listeners, callback);

    return {
        remove
    }
};
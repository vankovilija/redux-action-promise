import { Action } from 'redux';
import { removeListener } from './remove-listener';

export const addListener = (
    subscriptionState: {active: boolean},
    subscribe: () => void, unsubscribe: () => void,
    listeners: ((action: Action) => void)[]
): (callback: (action: Action) => void) => {remove: () => void} => (callback: (action: Action) => void) => {
    if (!subscriptionState.active) {
        subscribe();
    }

    listeners.push(callback);

    const remove = removeListener(subscriptionState, unsubscribe, listeners, callback);

    return {
        /**
         * Removes the listener callback function associated to this object
         */
        remove
    }
};
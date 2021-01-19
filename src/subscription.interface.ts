import { Action } from 'redux';

interface Listener {
    /**
     * Removes the listener callback function associated to this object
     */
    remove: () => void
}

export interface Subscription {
    /**
     * Removes the subscription from the store.
     */
    unsubscribe: () => void;
    /**
     * Adds a listener callback function to the subscription that will be called when any of the actions associated to
     * the subscription are dispatched on the store.
     *
     * @param {Function} callback is a function with one parameter, which is the action that was executed
     *
     * @returns {Listener} an object with a remove method that allows you to remove the added listener callback function
     * from the subscription
     */
    addListener: (callback: (action: Action) => void) => Listener;
}

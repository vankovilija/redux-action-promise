import { Action } from 'redux';

export const removeListener = (subscriptionState: {active: boolean}, unsubscribe: () => void, listeners: ((action: Action) => void)[], callback: (action) => void) =>
    /**
     * Removes the listener callback function associated to this object
     */
    () => {
    listeners.splice(listeners.indexOf(callback), 1);
    if (listeners.length === 0 && subscriptionState.active) {
        unsubscribe();
    }
};
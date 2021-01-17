import { Action } from 'redux';

export const removeListener = (subscriptionState: {active: boolean}, unsubscribe: () => void, listeners: ((action: Action) => void)[], callback: (action) => void) => () => {
    listeners.splice(listeners.indexOf(callback), 1);
    if (listeners.length === 0 && subscriptionState.active) {
        unsubscribe();
    }
};
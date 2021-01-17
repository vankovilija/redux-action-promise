import { ActiveSubscriptionsIndex } from '../enhancer';
import { Action } from 'redux';

export const unsubscribe = (subscriptionState: {active: boolean}, actions: (string | number)[], activeSubscriptionsIndex: ActiveSubscriptionsIndex, listeners: ((action: Action) => void)[]) => () => {
    actions.forEach((action) => {
        const listenersArray = activeSubscriptionsIndex[action];
        if (!listenersArray) {
            return 'continue';
        }
        const index = listenersArray.indexOf(listeners);
        if (index !== -1) {
            listenersArray.splice(index, 1);
        }
        if (listenersArray.length === 0) {
            delete activeSubscriptionsIndex[action];
        }
    });
    subscriptionState.active = false;
};
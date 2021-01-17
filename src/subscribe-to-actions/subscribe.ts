import { ActiveSubscriptionsIndex } from '../enhancer';
import { Action } from 'redux';

export const subscribe = (subscriptionState: {active: boolean}, actions: (string | number)[], activeSubscriptionsIndex: ActiveSubscriptionsIndex, listeners: ((action: Action) => void)[]) => () => {
    actions.forEach((action) => {
        if (!activeSubscriptionsIndex[action]) {
            activeSubscriptionsIndex[action] = [];
        }
        activeSubscriptionsIndex[action].push(listeners);
    });
    subscriptionState.active = true;
};

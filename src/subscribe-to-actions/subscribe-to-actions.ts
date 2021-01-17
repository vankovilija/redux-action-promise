import { Subscription } from '../subscription.interface';
import { mustBeNonEmptyArray } from '../must-be-non-empty-array.util';
import { mustBeUniqueArray } from '../must-be-unique-array.util';
import { ActiveSubscriptionsIndex, ValidationMode } from '../enhancer';
import { subscribe as subscribeFactory } from './subscribe';
import { unsubscribe as unsubscribeFactory } from './unsubscribe';
import { addListener as addListenerFactory } from './add-listener';

export const subscribeToActions = (validationMode: ValidationMode, activeSubscriptionsIndex: ActiveSubscriptionsIndex) => (actions: (string | number)[]): Subscription => {
    if (validationMode === ValidationMode.RUNTIME) {
        mustBeNonEmptyArray(actions, 'actions');
        mustBeUniqueArray(actions, (item) => `Action '${item}' is duplicated`);
    }

    const listeners = [];
    let subscriptionState = {active: false};

    const subscribe = subscribeFactory(subscriptionState, actions, activeSubscriptionsIndex, listeners);

    const unsubscribe = unsubscribeFactory(subscriptionState, actions, activeSubscriptionsIndex, listeners);

    const addListener = addListenerFactory(subscriptionState, subscribe, unsubscribe, listeners);

    return {
        addListener,
        unsubscribe
    };
};

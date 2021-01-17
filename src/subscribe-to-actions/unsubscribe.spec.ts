import { ActiveSubscriptionsIndex } from '../enhancer';
import { unsubscribe as unsubscribeFactory } from './unsubscribe';

describe('unsubscribe function that remove a subscription of listeners', () => {
    let unsubscribe, subscriptionState, actions, activeSubscriptionIndex: ActiveSubscriptionsIndex, listeners;
    beforeEach(() => {
        subscriptionState = {active: true};
        const action1 = 'action1';
        const action2 = 'action2';
        const action3 = 'action3';
        actions = [action1, action2, action3];
        listeners = [];
        activeSubscriptionIndex = {
            [action1]: [listeners],
            [action2]: [listeners],
            [action3]: [listeners]
        };
        unsubscribe = unsubscribeFactory(subscriptionState, actions, activeSubscriptionIndex, listeners);
    });

    it ('removes listeners from active subscription index', () => {
        unsubscribe();
        const keys = Object.keys(activeSubscriptionIndex);
        expect(keys.length).toEqual(0);
    });

    it ('sets subscription state to false', () => {
        unsubscribe();
        expect(subscriptionState.active).toBe(false);
    });
});

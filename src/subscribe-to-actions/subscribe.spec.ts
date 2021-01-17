import { subscribe as subscribeFactory } from './subscribe';
import { ActiveSubscriptionsIndex } from '../enhancer';

describe('subscribe function that adds a subscription of listeners', () => {
    let subscribe, subscriptionState, actions, activeSubscriptionIndex: ActiveSubscriptionsIndex, listeners;
    beforeEach(() => {
        subscriptionState = {active: false};
        const action1 = 'action1';
        const action2 = 'action2';
        const action3 = 'action3';
        actions = [action1, action2, action3];
        activeSubscriptionIndex = {};
        listeners = [];
        subscribe = subscribeFactory(subscriptionState, actions, activeSubscriptionIndex, listeners);
    });

    it ('adds actions to activeSubscriptionIndex', () => {
        subscribe();
        const keys = Object.keys(activeSubscriptionIndex);
        expect(keys).toEqual(actions);
        keys.forEach((key) => {
            expect(activeSubscriptionIndex[key][0]).toBe(listeners);
        })
    });

    it ('sets subscription state to true', () => {
        subscribe();
        expect(subscriptionState.active).toBe(true);
    });
});

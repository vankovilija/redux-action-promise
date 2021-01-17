import { addListener as addListenerFactory } from './add-listener';

describe('addListener adds a callback that executes whenever a subscribe action is processed', () => {
    let subscribe, unsubscribe, listeners, subscriptionState, addListener;
    beforeEach(() => {
        subscriptionState = {active: false};
        subscribe = jest.fn(() => subscriptionState.active = true);
        unsubscribe = jest.fn(() => subscriptionState.active = false);
        listeners = [];
        addListener = addListenerFactory(subscriptionState, subscribe, unsubscribe, listeners);
    });

    it ('adds a callback to the listener array', () => {
        const callback = jest.fn();
        addListener(callback);
        expect(listeners.length).toBe(1);
        expect(listeners[0]).toBe(callback);
    });

    it ('subscribes and sets the state to active', () => {
        const callback = jest.fn();
        addListener(callback);
        expect(subscribe).toBeCalledTimes(1);
        expect(subscriptionState.active).toBe(true);
    });

    it ('removes the listener from the listener array when remove is called', () => {
        const callback = jest.fn();
        const listenerHandler = addListener(callback);
        listenerHandler.remove();
        expect(listeners.length).toBe(0);
    });

    it ('unsubscribes and sets the state to inactive when all listeners are removed', () => {
        const callback = jest.fn();
        const listenerHandler = addListener(callback);
        listenerHandler.remove();
        expect(unsubscribe).toBeCalledTimes(1);
        expect(subscriptionState.active).toBe(false);
    });
});
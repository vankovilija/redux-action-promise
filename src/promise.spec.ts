import { promise } from './promise';
import { ValidationMode } from './enhancer';

describe('the promise function returns a promise that resolves when a specific action is processed', () => {
    const resolveAction1 = 'action1';
    const resolveAction2 = 'action2';
    const rejectAction1 = 'action3';
    const rejectAction2 = 'action4';
    const resolveActions = [resolveAction1, resolveAction2];
    const rejectActions = [rejectAction1, rejectAction2];
    let subscribeToActions, addListener, unsubscribe, removeListener, promiseFN, listenerFunctions;
    beforeEach(() => {
        removeListener = [];
        addListener = [];
        unsubscribe = [];
        listenerFunctions = [];
        subscribeToActions = jest.fn(() => {
            unsubscribe.push(jest.fn());
            removeListener.push(jest.fn());
            addListener.push(jest.fn((f) => {
                listenerFunctions.push(f);
                return {remove: removeListener[removeListener.length - 1]};
            }));
            return {
                addListener: addListener[addListener.length - 1],
                unsubscribe: unsubscribe[unsubscribe.length - 1]
            };
        });
        promiseFN = promise(ValidationMode.COMPILETIME, subscribeToActions);
    });

    it ('resolves promise when first listener function is called', async () => {
        const activePromise = promiseFN(resolveActions, rejectActions, 10);
        listenerFunctions[0]();
        await new Promise((r) => setTimeout(r, 30));
        return expect(activePromise).resolves.toBe(undefined);
    });

    it ('subscribes for one action if only one is provided', () => {
        promiseFN(resolveAction1, rejectAction1);
        expect(subscribeToActions).toBeCalledTimes(2);
        expect(subscribeToActions.mock.calls[0][0]).toEqual([resolveAction1]);
        expect(subscribeToActions.mock.calls[1][0]).toEqual([rejectAction1]);
        expect(addListener[0]).toBeCalledTimes(1);
        expect(addListener[1]).toBeCalledTimes(1);
    });

    it ('subscribes for all resolve and reject actions provided', () => {
        promiseFN(resolveActions, rejectActions);
        expect(subscribeToActions).toBeCalledTimes(2);
        expect(subscribeToActions.mock.calls[0][0]).toBe(resolveActions);
        expect(subscribeToActions.mock.calls[1][0]).toBe(rejectActions);
        expect(addListener[0]).toBeCalledTimes(1);
        expect(addListener[1]).toBeCalledTimes(1);
    });

    it ('subscribes only to the resolveActions if no rejectActions are provided', () => {
        promiseFN(resolveActions);
        expect(subscribeToActions).toBeCalledTimes(1);
        expect(subscribeToActions.mock.calls[0][0]).toBe(resolveActions);
        expect(addListener[0]).toBeCalledTimes(1);
    });

    it ('subscribes only to the rejectActions if no resolveActions are provided', () => {
        promiseFN([], rejectActions);
        expect(subscribeToActions).toBeCalledTimes(1);
        expect(subscribeToActions.mock.calls[0][0]).toBe(rejectActions);
        expect(addListener[0]).toBeCalledTimes(1);
    });

    it ('unsubscribes of all subscriptions when the promise is canceled', () => {
        const activePromise = promiseFN(resolveActions, rejectActions);
        activePromise.cancel();
        expect(unsubscribe[0]).toBeCalledTimes(1);
        expect(unsubscribe[1]).toBeCalledTimes(1);
    });

    it ('times out the promise and rejects it when timeout is set', () => {
        const activePromise = promiseFN(resolveActions, rejectActions, 10);
        return expect(activePromise).rejects.toThrowError('Timed out promise');
    });

    it ('does not timeout the promise if canceled', async () => {
        const activePromise = promiseFN(resolveActions, rejectActions, 10);
        activePromise.cancel();

        let resolved = false;
        activePromise.then(() => resolved = true);
        activePromise.catch(() => resolved = true);

        await new Promise(r => setTimeout(r, 20));

        expect(resolved).toBe(false);
    });
});
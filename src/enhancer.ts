import { Action, StoreEnhancer } from 'redux';
import { mustBeFunction } from './must-be-function.util';
import { mustBeArray } from './must-be-array.util';
import { mustBeNumber } from './must-be-number.util';
import { TimeoutError } from './timeout-error';

export const ActionPromiseEnhancer: StoreEnhancer<{promise: (resolveActions: (string | number)[], rejectActions?: (string | number)[], timeout?: number) => Promise<Action>}> = (createStore) => {
    mustBeFunction(createStore, 'createStore');
    return (...args) => {
        const store = createStore(...args);

        const activePromises = [];

        const processAction = (action) => {
            const activePromisesBuffer = activePromises.slice();
            for (const activePromise of activePromisesBuffer) {
                let handled: boolean = false;
                if (activePromise.resolveActions.indexOf(action.type) !== -1) {
                    activePromise.resolve(action);
                    handled = true;
                } else if (activePromise.rejectActions.indexOf(action.type) !== -1) {
                    activePromise.reject(action);
                    handled = true;
                }
                if (handled) {
                    activePromises.splice(activePromises.indexOf(activePromise), 1);
                }
            }
        };

        const dispatch = (action) => {
            processAction(action);
            return store.dispatch(action);
        }

        const promise = (resolveActions: (string | number)[], rejectActions: (string | number)[] = [], timeout: number = -1) => {
            mustBeArray(resolveActions, 'resolveActions');
            mustBeArray(rejectActions, 'rejectActions');
            mustBeNumber(timeout, 'timeout');
            let promise = (new Promise((resolve, reject) => {
                activePromises.push({
                    resolve, reject, resolveActions, rejectActions, timeout
                })
            })) as Promise<Action>;
            if (timeout > -1) {
                promise = Promise.race([promise, new Promise((_, reject) => {
                    setTimeout(() => {
                        reject(new TimeoutError());
                        activePromises.splice(activePromises.indexOf(promise), 1);
                    }, timeout);
                })]) as Promise<Action>;
            }
            return promise;
        }

        return { ...store, dispatch, promise }
    }
}
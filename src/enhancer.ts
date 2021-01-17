import { Action, StoreEnhancer } from 'redux';
import { mustBeFunction } from './must-be-function.util';
import { mustBeArray } from './must-be-array.util';
import { mustBeNumber } from './must-be-number.util';
import { TimeoutError } from './timeout-error';
import { RejectActionErrorError } from "./reject-action-error";
import { mustBeUniqueArray } from "./must-be-unique-array.util";
import { mustNotContainArray } from "./must-not-contain-array.util";
import { Subscription } from "./subscription.interface";
import { mustBeNonEmptyArray } from "./must-be-non-empty-array.util";
import { invariant } from "./invariant.util";
import { EnhancedMethods } from "./action-promise-store.interface";

type ActiveSubscriptionsIndex = {[action: string]: ((action: Action) => void)[][]}

export enum ValidationMode {
    RUNTIME = 'runtime',
    COMPILETIME = 'compiletime'
}

export const ActionPromiseEnhancer: StoreEnhancer<EnhancedMethods> & {validationMode: ValidationMode} = (createStore) => {
    if (ActionPromiseEnhancer.validationMode === ValidationMode.RUNTIME) {
        mustBeFunction(createStore, 'createStore');
    }
    return (...args) => {
        const store = createStore(...args);

        const activeSubscriptionsIndex: ActiveSubscriptionsIndex = {};

        const processAction = (action: Action) => {
            if (!activeSubscriptionsIndex[action.type]) {
                return;
            }
            const activeSubscriptionsBuffer = activeSubscriptionsIndex[action.type].slice();
            for (let i = 0; i < activeSubscriptionsBuffer.length; i++) {
                const activeListenersArray = activeSubscriptionsBuffer[i].slice();
                activeListenersArray.forEach((listener) => listener(action))
            }
        };

        const dispatch = (action) => {
            processAction(action);
            return store.dispatch(action);
        };

        const subscribeToActions = (actions: (string | number)[]): Subscription => {
            if (ActionPromiseEnhancer.validationMode === ValidationMode.RUNTIME) {
                mustBeNonEmptyArray(actions, 'actions');
                mustBeUniqueArray(actions, (item) => `Action '${item}' is duplicated`);
            }
            const listeners = [];
            actions.forEach((action) => {
                if (!activeSubscriptionsIndex[action]) {
                    activeSubscriptionsIndex[action] = [];
                }
                activeSubscriptionsIndex[action].push(listeners)
            });
            const addListener = (callback) => {
                listeners.push(callback)
                return {
                    remove: () => {
                        listeners.splice(listeners.indexOf(callback), 1);
                    }
                }
            };
            const unsubscribe = () => {
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
            };
            return {
                addListener,
                unsubscribe
            };
        };

        const promise = (resolveActions: (string | number)[], rejectActions: (string | number)[] = [], timeout: number = -1) => {
            if (ActionPromiseEnhancer.validationMode === ValidationMode.RUNTIME) {
                mustBeArray(resolveActions, 'resolveActions');
                mustBeArray(rejectActions, 'rejectActions');
                mustBeUniqueArray(resolveActions, (item) => `Resolve action '${item}' is duplicated`);
                mustBeUniqueArray(rejectActions, (item) => `Reject action '${item}' is duplicated`);
                mustNotContainArray(resolveActions, rejectActions, (item) => `Action '${item}' is present in resolve and reject actions`)
                mustBeNumber(timeout, 'timeout');
                invariant(resolveActions.length > 0 || rejectActions.length > 0, 'One of the resolve or reject actions array must contain elements');
            }
            let resolveSubscription: Subscription;
            if (resolveActions.length > 0) {
                resolveSubscription = subscribeToActions(resolveActions);
            }
            let rejectSubscription: Subscription;
            if (rejectActions.length > 0) {
                rejectSubscription = subscribeToActions(rejectActions);
            }
            const finalizePromise = () => {
                if (resolveSubscription) {
                    resolveSubscription.unsubscribe();
                }
                if (rejectSubscription) {
                    rejectSubscription.unsubscribe();
                }
            };

            let promise = (new Promise((resolve, reject) => {
                if (resolveSubscription) {
                    resolveSubscription.addListener(action => {
                        finalizePromise();
                        resolve(action);
                    });
                }
                if (rejectSubscription) {
                    rejectSubscription.addListener(action => {
                        finalizePromise();
                        reject(new RejectActionErrorError(action));
                    })
                }
            })) as Promise<Action> & {cancel: () => void};
            promise.cancel = finalizePromise;
            if (timeout > -1) {
                let timeoutId;
                promise = Promise.race([promise, new Promise((_, reject) => {
                    timeoutId = setTimeout(() => {
                        finalizePromise();
                        reject(new TimeoutError());
                    }, timeout);
                })]) as Promise<Action> & {cancel: () => void};
                promise.cancel = () => {
                    clearTimeout(timeoutId);
                    finalizePromise();
                }
            }
            return promise;
        };

        return { ...store, dispatch, promise, subscribeToActions }
    }
};

ActionPromiseEnhancer.validationMode = ValidationMode.RUNTIME;
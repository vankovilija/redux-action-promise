import { mustBeArray } from './must-be-array.util';
import { mustBeUniqueArray } from './must-be-unique-array.util';
import { mustNotContainArray } from './must-not-contain-array.util';
import { mustBeNumber } from './must-be-number.util';
import { invariant } from './invariant.util';
import { Subscription } from './subscription.interface';
import { RejectActionError } from './reject-action-error';
import { Action, AnyAction } from 'redux';
import { TimeoutError } from './timeout-error';
import { ValidationMode } from './enhancer';
import { ActionCreatorType, SubscriberFunction } from './action-promise-store.interface';

type ReturnPromise = Promise<Action> & {cancel: () => void}

export const promise = (validationMode: ValidationMode, subscribeToActions: SubscriberFunction) =>
    (resolveActions: (string | number | ActionCreatorType | AnyAction)[], rejectActions: (string | number | ActionCreatorType | AnyAction)[] = [], timeout: number = -1) => {
    if (validationMode === ValidationMode.RUNTIME) {
        mustBeArray(resolveActions, 'resolveActions');
        mustBeArray(rejectActions, 'rejectActions');
        mustBeUniqueArray(resolveActions, (item) => `Resolve action '${item}' is duplicated`);
        mustBeUniqueArray(rejectActions, (item) => `Reject action '${item}' is duplicated`);
        mustNotContainArray(resolveActions, rejectActions, (item) => `Action '${item}' is present in resolve and reject actions`);
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
        const subscriptionFunction = (finalization: 'resolve' | 'reject') => action => {
            finalizePromise();
            finalization === 'resolve' ? resolve(action) : reject(new RejectActionError(action));
        };
        if (resolveSubscription) {
            resolveSubscription.addListener(subscriptionFunction('resolve'));
        }
        if (rejectSubscription) {
            rejectSubscription.addListener(subscriptionFunction('reject'));
        }
    })) as ReturnPromise;

    promise.cancel = finalizePromise;

    if (timeout > -1) {
        let timeoutId;
        promise = Promise.race([promise, new Promise((_, reject) => {
            timeoutId = setTimeout(() => {
                finalizePromise();
                reject(new TimeoutError());
            }, timeout);
        })]) as ReturnPromise;
        promise.cancel = () => {
            clearTimeout(timeoutId);
            finalizePromise();
        }
    }
    return promise;
};
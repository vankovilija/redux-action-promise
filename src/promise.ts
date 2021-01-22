import { mustBeArray } from './must-be-array.util';
import { mustBeUniqueArray } from './must-be-unique-array.util';
import { mustNotContainArray } from './must-not-contain-array.util';
import { mustBeNumber } from './must-be-number.util';
import { invariant } from './invariant.util';
import { Subscription } from './subscription.interface';
import { RejectActionError } from './reject-action-error';
import { Action } from 'redux';
import { TimeoutError } from './timeout-error';
import { ValidationMode } from './enhancer';
import { ArrayOrSingleAnyTypeOfAction, SubscriberFunction } from './action-promise-store.interface';
import { convertToArray } from './convert-to-array.util';

type ReturnPromise = Promise<Action> & {cancel: () => void}

export const promise = (validationMode: ValidationMode, subscribeToActions: SubscriberFunction) =>
    /**
     * The promise function is used to generate a promise that resolves or rejects when any of a given list of actions
     * is dispatched on the target store.
     *
     * @param {number|string|Action|ActionCreator<Action> | Array.<number|string|Action|ActionCreator<Action>>} resolveActions is an array of action types or action creators, when any
     * of these is dispatched to the store the promise will be resolved.
     *
     * @param {number|string|Action|ActionCreator<Action> | Array.<number|string|Action|ActionCreator<Action>>} rejectActions is an array of action types or action creators, when any of
     * these is dispatched to the store the promise will be rejected.
     *
     * @param timeout is the number of ms that will timeout this promise and cause it to reject with a TimeoutError
     *
     * @returns {Promise.<Action>} resolves with the action that is dispatches, or rejects with an error that contains
     * that action that is dispatched in a `rejectAction` property of the error object
     */
    (resolveActions: ArrayOrSingleAnyTypeOfAction, rejectActions: ArrayOrSingleAnyTypeOfAction = [], timeout: number = -1) => {
    const resActions = convertToArray(resolveActions);
    const rejActions = convertToArray(rejectActions);
    if (validationMode === ValidationMode.RUNTIME) {
        mustBeArray(resActions, 'resolveActions');
        mustBeArray(rejActions, 'rejectActions');
        mustBeUniqueArray(resActions, (item) => `Resolve action '${item}' is duplicated`);
        mustBeUniqueArray(rejActions, (item) => `Reject action '${item}' is duplicated`);
        mustNotContainArray(resActions, rejActions, (item) => `Action '${item}' is present in resolve and reject actions`);
        mustBeNumber(timeout, 'timeout');
        invariant(resActions.length > 0 || rejActions.length > 0, 'One of the resolve or reject actions array must contain elements');
    }

    let resolveSubscription: Subscription;

    if (resActions.length > 0) {
        resolveSubscription = subscribeToActions(resActions);
    }

    let rejectSubscription: Subscription;

    if (rejActions.length > 0) {
        rejectSubscription = subscribeToActions(rejActions);
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
import { Action, StoreEnhancer } from 'redux';
import { mustBeFunction } from './must-be-function.util';
import { EnhancedMethods } from './action-promise-store.interface';
import { subscribeToActions } from './subscribe-to-actions';
import { promise } from './promise';
import { invariant } from './invariant.util';
import { dispatch } from './dispatch';

export type ActiveSubscriptionsIndex = {[action: string]: ((action: Action) => void)[][]}

export enum ValidationMode {
    RUNTIME = 'runtime',
    COMPILETIME = 'compiletime'
}

let validationMode: ValidationMode;
let isExecuted = false;

export const ActionPromiseEnhancer: StoreEnhancer<EnhancedMethods> & {validationMode: ValidationMode} = (createStore) => {
    isExecuted = true;
    if (ActionPromiseEnhancer.validationMode === ValidationMode.RUNTIME) {
        mustBeFunction(createStore, 'createStore');
    }
    return (...args) => {
        const store = createStore(...args);

        const activeSubscriptionsIndex: ActiveSubscriptionsIndex = {};

        const subscriber = subscribeToActions(ActionPromiseEnhancer.validationMode, activeSubscriptionsIndex);

        const promiseFunction = promise(ActionPromiseEnhancer.validationMode, subscriber);

        const dispatchFunction = dispatch(activeSubscriptionsIndex, promiseFunction, store.dispatch);

        return {
            ...store,
            dispatch: dispatchFunction,
            promise: promiseFunction,
            subscribeToActions: subscriber
        } as any;
    }
};

Object.defineProperty(ActionPromiseEnhancer, 'validationMode', {
    get: () => {
        return validationMode;
    },
    set: (v: ValidationMode) => {
        invariant(!isExecuted, 'Can only set validationMode before using the ActionPromiseEnhancer');
        validationMode = v;
    }
});

ActionPromiseEnhancer.validationMode = ValidationMode.RUNTIME;

import { Subscription } from "./subscription.interface";
import { mustBeNonEmptyArray } from "./must-be-non-empty-array.util";
import { mustBeUniqueArray } from "./must-be-unique-array.util";
import { ActiveSubscriptionsIndex, ValidationMode } from "./enhancer";

export const subscribeToActions = (validationMode: ValidationMode, activeSubscriptionsIndex: ActiveSubscriptionsIndex) => (actions: (string | number)[]): Subscription => {
    if (validationMode === ValidationMode.RUNTIME) {
        mustBeNonEmptyArray(actions, 'actions');
        mustBeUniqueArray(actions, (item) => `Action '${item}' is duplicated`);
    }

    const listeners = [];
    let subscriptionActive = false;

    const subscribe = () => {
        actions.forEach((action) => {
            if (!activeSubscriptionsIndex[action]) {
                activeSubscriptionsIndex[action] = [];
            }
            activeSubscriptionsIndex[action].push(listeners);
        });
        subscriptionActive = true;
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
        subscriptionActive = false;
    };

    const addListener = (callback) => {
        if (!subscriptionActive) {
            subscribe();
        }

        listeners.push(callback);

        const remove = () => {
            listeners.splice(listeners.indexOf(callback), 1);
            if (listeners.length === 0 && subscriptionActive) {
                unsubscribe();
            }
        };

        return {
            remove
        }
    };

    return {
        addListener,
        unsubscribe
    };
};

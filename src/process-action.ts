import { Action } from "redux";
import { ActiveSubscriptionsIndex } from "./enhancer";

export const processAction = (activeSubscriptionsIndex: ActiveSubscriptionsIndex, action: Action) => {
    if (!activeSubscriptionsIndex[action.type]) {
        return;
    }
    const activeSubscriptionsBuffer = activeSubscriptionsIndex[action.type].slice();
    for (let i = 0; i < activeSubscriptionsBuffer.length; i++) {
        const activeListenersArray = activeSubscriptionsBuffer[i].slice();
        activeListenersArray.forEach((listener) => listener(action))
    }
};
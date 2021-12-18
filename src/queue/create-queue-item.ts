import {ActionCreatorType, RequestAction} from "../action-promise-store.interface";
import {Action, AnyAction} from "redux";
import {isActionCreator} from "../subscribe-to-actions/is-action-creator.util";
import {QueueItem} from "./queue-item.interface";

function queueItemGenerator<T extends (RequestAction<A>), A extends Action = AnyAction>(requestAction: T, priority: number) {
    return {
        ...requestAction,
        priority
    };
}

type ReturnType<T, A extends Action = AnyAction> =
    T extends ActionCreatorType ? ActionCreatorType<QueueItem<A>> :
        T extends Action ? QueueItem<A> :
            never;

/**
 * A function that wraps your request action object or request action creator function to generate a action or action creator that has
 * a special data set that when dispatched in a queue will act as a request action, returning a promise, but will also respect
 * its priority enry in the queue. Items with highest priority will be at the top of the queue.
 *
 * @param {AnyAction | ActionCreatorType<AnyAction>} requestAction an request action or request action creator to wrap
 * @param {number} priority the priority of this specific action in a queue.
 */

export function createQueueItem<T extends (RequestAction<A> | ActionCreatorType<RequestAction<A>>), A extends Action = AnyAction>(requestAction: T, priority?: number): ReturnType<T, A> {
    if (isActionCreator(requestAction)) {
        return ((...args) => {
            const actionObject = requestAction(...args);
            return queueItemGenerator(actionObject, priority);
        }) as unknown as ReturnType<T, A>;
    }
    return queueItemGenerator(requestAction as any, priority);
}
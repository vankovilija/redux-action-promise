import {QueueItem} from './queue-item.interface';
import {isNumber} from '../is-number.util';
import {isRequestAction} from "../create-request-action";
import {Action, AnyAction} from "redux";

export function isQueueItem<T extends Action = AnyAction>(item: T | QueueItem): item is QueueItem {
    return isRequestAction(item) &&
        'priority' in item &&
        (isNumber((item as any).priority) || (item as any).priority === undefined)
}
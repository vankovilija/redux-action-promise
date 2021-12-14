import {QueueItem} from './queue-item.interface';
import {isActionObject} from '../subscribe-to-actions/is-action-object.util';
import {isNumber} from '../is-number.util';

export function isQueueItem<T>(item: T | QueueItem): item is QueueItem {
    return 'startAction' in item &&
        'endActions' in item &&
        'priority' in item &&
        isActionObject((item as any).startAction) &&
        (isActionObject((item as any).endAction) || (item as any).endAction === undefined) &&
        (isNumber((item as any).priority) || (item as any).priority === undefined)
}
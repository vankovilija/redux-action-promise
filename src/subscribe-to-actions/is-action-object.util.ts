import { Action } from 'redux';

export function isActionObject(action: any | Action): action is Action {
    return typeof action === 'object' && action !== null && 'type' in action;
}
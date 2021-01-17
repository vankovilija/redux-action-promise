import { invariant } from './invariant.util';

export const mustBeArray = (arr, arrayName: string) => {
    invariant(arr && typeof arr.length === 'number', `${arrayName} must be an array`)
}

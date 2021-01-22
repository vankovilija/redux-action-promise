import { invariant } from './invariant.util';
import { isArray } from './is-array.util';

export const mustBeArray = (arr, arrayName: string) => {
    invariant(isArray(arr), `${arrayName} must be an array`)
};

import { invariant } from './invariant.util';
import { mustBeArray } from './must-be-array.util';

export const mustBeNonEmptyArray = (arr, arrayName: string) => {
    mustBeArray(arr, arrayName)
    invariant(arr.length > 0, `${arrayName} must be a non-empty array`)
};

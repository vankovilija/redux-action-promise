import { invariant } from './invariant.util';
import { isArray } from './is-array.util';

export const mustNotContainArray = (arr1, arr2, errorTemplate: (item: string) => string) => {
    if (!arr1 || !arr2)
        return;

    if (!isArray(arr1)) {
        arr1 = [arr1];
    }
    if (!isArray(arr2)) {
        arr2 = [arr2];
    }
    for (const item of arr1) {
        invariant(arr2.indexOf(item) === -1, errorTemplate(item));
    }
};

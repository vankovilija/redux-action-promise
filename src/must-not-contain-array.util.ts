import { invariant } from './invariant.util';

export const mustNotContainArray = (arr1, arr2, errorTemplate: (item: string) => string) => {
    for (const item of arr1) {
        invariant(arr2.indexOf(item) === -1, errorTemplate(item));
    }
}

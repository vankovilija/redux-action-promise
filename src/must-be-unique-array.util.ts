import { invariant } from './invariant.util';

export const mustBeUniqueArray = (arr, errorTemplate: (item: string) => string) => {
    const foundItems = [];
    for (const item of arr) {
        invariant(foundItems.indexOf(item) === -1, errorTemplate(item));
        foundItems.push(item);
    }
}
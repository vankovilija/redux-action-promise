import { invariant } from './invariant.util';

export const mustBeNumber = (num, numberName: string) => {
    invariant(typeof num === 'number', `${numberName} must be a number`)
}

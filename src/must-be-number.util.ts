import { invariant } from './invariant.util';
import {isNumber} from './is-number.util';

export const mustBeNumber = (num, numberName: string) => {
    invariant(isNumber(num), `${numberName} must be a number`)
};

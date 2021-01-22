import { invariant } from './invariant.util';

export const mustBeFunction = (fn, functionName: string) => {
    invariant(typeof fn === 'function', `${functionName} must be a function`)
};

import { ActionCreatorType } from '../action-promise-store.interface';

export function isActionCreator(functionToCheck: any | ActionCreatorType): functionToCheck is ActionCreatorType {
    return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
}
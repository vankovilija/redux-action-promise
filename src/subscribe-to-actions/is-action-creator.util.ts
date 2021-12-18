import { ActionCreatorType } from '../action-promise-store.interface';
import {Action, AnyAction} from "redux";

export function isActionCreator<A extends Action = AnyAction>(functionToCheck: any | ActionCreatorType<A>): functionToCheck is ActionCreatorType<A> {
    return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
}
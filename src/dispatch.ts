import { processAction } from './process-action';
import { ActiveSubscriptionsIndex } from './enhancer';
import { Action, AnyAction, Dispatch } from 'redux';
import { DispatchFunction, PromiseAction, PromiseFunction } from './action-promise-store.interface';

function isPromiseAction<A extends Action = AnyAction>(action: A | PromiseAction<A>): action is PromiseAction<A> {
    return typeof action === 'object' && action !== null &&  'promise' in action;
}

export const dispatch = <A extends Action = AnyAction>(
    activeSubscriptionsIndex: ActiveSubscriptionsIndex,
    promise: PromiseFunction,
    dispatchFunction: Dispatch<A>
): DispatchFunction<A> => ((action: A) => {
    let toReturn: any = dispatchFunction(action);
    if (isPromiseAction(action)) {
        toReturn = promise(action.promise.resolveActions || [], action.promise.rejectActions, action.promise.timeout);
    }
    processAction(activeSubscriptionsIndex, action);
    return toReturn;
}) as any;
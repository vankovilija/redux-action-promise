import { Action, AnyAction, Store } from 'redux';

export interface ActionPromiseStore<S = any, A extends Action = AnyAction> extends Store<S, A> {
    promise: (resolveActions: (string | number)[], rejectActions?: (string | number)[], timeout?: number) => Promise<A>
}
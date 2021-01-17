import { Action, AnyAction, Store } from 'redux';
import { Subscription } from "./subscription.interface";

export type SubscriberFunction = (actions: (string | number)[]) => Subscription;

export type EnhancedMethods<S = any, A extends Action = AnyAction> = {
    promise: (resolveActions: (string | number)[], rejectActions?: (string | number)[], timeout?: number) => Promise<A> & {cancel: () => void},
    subscribeToActions: SubscriberFunction
}

export type ActionPromiseStore<S = any, A extends Action = AnyAction> = Store<S, A> & EnhancedMethods<S, A>

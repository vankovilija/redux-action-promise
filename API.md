# Redux action promise enhancer API spec
## Store level methods

#### Store level methods
 - [dispatch](#dispatch)
 - [promise](#promise)
 - [createActionQueue](#create-action-queue)
 - [subscribeToActions](#subscribe-to-actions)
#### Library level
 -- Classes 
 - [Subscription](#subscription)
 - [CancelablePromise](#cancelable-promise)
 - [ActionQueue](#action-queue)
 - [RequestAction](#request-action)
 - [QueueItem](#queue-item)
 - [Listener](#listener)

 -- Methods
 - [createRequestAction](#create-request-action)
 - [createQueueItem](#create-queue-item)


### Dispatch
The dispatch function is updated when this enhancer is applied, the first parameter of the dispatch function can be any
redux action or a request action. If a request action is provided, the return from the dispatch will be a CancelablePromise
that is resolved when the store dispatches either a resolve or a reject action.
```typescript
function dispatch(action: Action | RequestAction): Action | CancelablePromise
```
#### params
**action** - A redux action object or a RequestAction object.

#### returns
If a redux action is provided, this method also returns a redux action, this is to keep backward compatibility with vanilla
redux, and make integrations of action promise enhancer simpler. If however, a request action is provided, the dispatch
action will return a cancelable promise, that will be resolved when one of the responseActions or errorActions for this 
request action are dispatched on the store.

#### example

```typescript
import {createRequestAction} from "./create-request-action";

const resolveAction = {type: 'exampleResolveAction'};
console.log('request action created');
const requestAction = createRequestAction({type: 'exampleStartAction'}, resolveAction, {type: 'exampleRejectAction'});
console.log('request action dispatched');
const requestActionPromise = store.dispatch(requestAction);

requestActionPromise.then(() => console.log('request action resolved'));
console.log('resolve action dispatched');
store.dispatch(resolveAction);
```
logs:
```
request action created
request action dispatched
resolve action dispatched
request action resolved
```
### Promise
The promise method is used to create a cancelable promise that will resolve when any of the resolve actions is dispatched
on the store, or reject, when any of the reject actions is dispatched on the store.

```typescript
function promise(resolveActions: AnyAction | AnyAction[], rejectActions: AnyAction | AnyAction[] = [], timeout: number = -1): CancelablePromise
```
#### params
**resolveActions** - an array or a single action that is expected to be dispatched on the store at a later date (after promise creation)
that will resolve the promise returned.

**rejectActions** - an array or a single action that is expected to be dispatched on the store at a later date (after promise creation)
that will reject the promise returned.

**timeout** - a number that specifies the amount of *ms* until the request action times out, and the promise is rejected due to it
(this will occur if no resolve action and no reject action are dispatched in that time from when the promise is created
to the dispatch method of the store).

### Subscribe to Actions
```typescript
function subscribeToActions(actions: ArrayOrSingleAnyTypeOfAction): Subscription
```
#### params
**actions** - an array or a single action that is expected to be dispatched on the store at a later date (after subscription creation)
that will trigger all callbacks added as listeners to the subscription. Subscriptions are not automatically removed, and will
be forever active if not unsubscribed.

#### returns
a Subscription instance

### Create Action Queue
A method that generates a priority order, action queue, that is based on Cancelable promises on that store. When a promise
is canceled, it is also removed from the queue and the queue will continue executing other promises.

The Action queue is useful in large applications when you want to maintain order of execution of certain actions, but
those actions may be dispatched in different areas of the application, possibly by multiple teams.

```typescript
function createActionQueue(): ActionQueue
```
#### returns
an instance of a ActionQueue
## Library level
### Create request action
Creates a request action, that when dispatched on a store that is enhanced with action promise enhancer will return a promise
that is resolved when any of the response actions is dispatched on the store, or rejected when any of the reject actions is
dispatched on the store.
```typescript
function createRequestAction(
    action: AnyAction,
    responseActions?: AnyAction | AnyAction[],
    errorActions?: AnyAction | AnyAction[],
    timeout?: number
): RequestAction
```
#### params
**action** - the main action dispatched in the store when a request action is provided.

**responseActions** - an array or a single action that is expected to be dispatched on the store at a later date (after action)
that will resolve the promise returned from the dispatch when providing the request action to it.

**errorActions** - an array or a single action that is expected to be dispatched on the store at a later date (after action)
that will reject the promise returned from dispatch when providing the request action to it.

**timeout** - a number that specifies the amount of *ms* until the request action times out, and the promise is rejected due to it
(this will occur if no response action and no error action are dispatched in that time from when the request action is provided
to the dispatch method of the store).

#### returns
RequestAction type
### Create queue item
Creates a queue item that can be dispatched as a regular action, however, if dispatched in a queue, it will follow its
defined priority and dispatch with that priority at an appropriate time.
```typescript
function createQueueItem(requestAction: RequestAction, priority?: number): QueueItem
```
#### params
**requestAction** - a request action that will be used as bases for the queue item

**priority** - a optional number that specifies the priority this item has in a queue, items with the largest priority
will be at the top of the queue, while items with the lowest priority will be at the bottom. Items with undefined
priority will be added at the bottom of the queue after any defined priority in the order they were added.

#### returns
QueueItem type

### Subscription
A Subscription is a class that is instantiated on every subscription on a redux action. The class contains methods to attach
listeners to this subscription, invoked when the action it is subscribed to is dispatched, and an unsubscribe method,
removing all listeners, and deactivating the subscription.
```typescript
function CallbackFunction (action: Action): void

class Subscription {
    unsubscribe(): void
    addListener(callback: CallbackFunction): Listener
}
```
#### properties
**unsubscribe** - A method that when invoked removes all listeners from a Subscription and stops the subscription from
listening to store actions.

**addListener** - a method that adds a listener when any one of the actions

#### params

**callback** - a well-defined callback method that is involved when ever any of the subscription actions is dispatched

#### returns
**Listener** - an instance of a Listener, that references the listener attached to this particular callback function.
### Listener
A listener object that references one callback attached to a subscription
```typescript
interface Listener {
    remove: () => void
}
```
#### properties
**remove** - removes the listener referenced by this particular listener object.

### Request action
A Request action object is an object that extends a redux action, however also contains a promise object that defines the
resolveActions, rejectActions for that promise and the timeout. The promise defined here is considered to be the response
to the request action.

The main action is still held in the regular Action parameters that redux uses (namely `type`, `payload`)
```typescript
interface RequestAction extends Action {
    promise: {
        resolveActions: AnyAction | AnyAction[],
        rejectActions?: AnyAction | AnyAction[],
        timeout?: number
    }
}
```

#### properties
**promise** - an object containing 3 properties that define the promise needed to get a response on the request action.

**responseActions** - an array or a single action that is expected to be dispatched on the store at a later date (after action)
that will resolve the promise returned from the dispatch when providing the request action to it.

**errorActions** - an array or a single action that is expected to be dispatched on the store at a later date (after action)
that will reject the promise returned from dispatch when providing the request action to it.

**timeout** - a number that specifies the amount of *ms* until the request action times out, and the promise is rejected due to it
(this will occur if no response action and no error action are dispatched in that time from when the request action is provided
to the dispatch method of the store).

### Queue item
A Queue item is a request action with a defined priority to be used when dispatched in a queue
```typescript
interface QueueItem extends RequestAction {
    priority: number
}
```

#### properties
**priority** - a optional number property that specifies the priority this item has in a queue, items with the largest priority
will be at the top of the queue, while items with the lowest priority will be at the bottom. Items with undefined
priority will be added at the bottom of the queue after any defined priority in the order they were added.

### Cancelable promise
Cancelable promise is a class that extends regular vanilla javascript Promise with an extra cancel method. When invoked
this method will clear all listeners to actions that can resolve this promise, and the promise will be set in a canceled
state, and will no longer be resolvable.
```typescript
class CancelablePromise extends Promise {
    cancel(): void
}
```
#### properties
**cancel** - will cancel the promise and the promise will remain unresolvable.

### Action queue
```typescript
class ActionQueue {
    pauseQueue(): void
    resumeQueue(): void
    
    dispatch(
        action: Action | RequestAction | QueueItem,
        completeActions?: ArrayOrSingleAnyTypeOfAction<A>,
        errorActions?: ArrayOrSingleAnyTypeOfAction<A>, 
        priority?: Number
    ): CancelablePromise
}
```
#### properties
**pauseQueue** - when paused the queue will not execute the next action in its list after the currently ongoing action is finished.
Please note that any already started action will not be paused, and it will be resolved / canceled when its appropriate resolve action
is called.

**resumeQueue** - A paused queue can be resumed, if called while an action from the queue is still being executed, it will wait for
that action to finish and then continue as normal, if called when no action is ongoing, and the queue is paused, it will 
start the next action in the queue.


**dispatch** - dispatches an action, just like a regular redux dispatch, however, it can accept multiple parameters, and
different types of actions including a QueueItem.

### parameters
**action** - any redux action or a request action or a queue action

**completeActions** - an optional list of actions, if any of these actions are triggered, the returning promise will be
resolved, and the queue will pick up the next action that was dispatched to it. If the completeActions parameter is not
provided, then the action is considered resolved, as soon as it is dispatched.

**errorActions** - an optional list of actions, if any of these actions are triggered, the returning promise will be
rejected.

**priority** - an optional priority weight for this action, actions with highest priority will be first in the queue, 
the queue will always remain sorted in such a way that the highest priority action is dispatched first.
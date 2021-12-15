# Redux Action Promise
Create a promise from a redux store and a list of expected actions that will resolve in the future

## Installation

```
npm install redux-action-promise-enhancer
```

or with yarn

```
yarn add redux-action-promise-enhancer
```

## Usage

### importing
```typescript
import ActionPromiseEnhancer from 'redux-action-promise-enhancer';
```

or

```typescript
import { ActionPromiseEnhancer } from 'redux-action-promise-enhancer';
```

using require

```typescript
const ActionPromiseEnhancer = require('redux-action-promise-enhancer').default;
```

### Composing with a redux store

Creation
```typescript
const store: ActionPromiseStore = createStore(myReducer, ActionPromiseEnhancer);
```
if you have multiple enhancers, simply using the redux <a href="https://redux.js.org/api/compose/">compose</a> functionality
```typescript
const store: ActionPromiseStore = createStore(myReducer, compose(ActionPromiseEnhancer, ...otherEnhancers));
```

## Contents

[Request Actions](#request-actions)

[Action Promises](#action-promises)

[Action Subscriptions](#action-subscriptions)

[Action Queue](#action-queue)

### Request Actions

sometimes we want to dispatch an action, and we want to know when a following action has occurred where we dispatched our action, however, we can't easily do this with redux, this is where request actions come in, when you feed a request action to the dispatch function it will respond with a promise that you can await to get the payload of the subsequently dispatched action

```typescript
import ActionPromiseEnhancer, { createRequestAction, ActionPromiseStore } from 'redux-action-promise-enhancer';

const MyActionType1 = 'my-action';
const MyResponseAction1 = {type: 'my-action-completed'};
const requestActionCreator = createRequestAction((payload: number) => ({
        type: MyActionType1,
        payload
    }), MyResponseAction1);

const store: ActionPromiseStore = createStore(myReducer, ActionPromiseEnhancer);

const dispatch = async () => {
    const response = await store.dispatch(requestActionCreator(1));
    
    console.log('awaited response', response);
};

store.subscribeToActions(MyActionType1).addListener((action) => {
    console.log('request action', action)
    store.dispatch(MyResponseAction1);
});

dispatch();
```

logs:
```
request action {
    type: 'my-action',
    payload: 1
}

awaited response { type: 'my-action-completed' }
```

handling errors in request actions

```typescript
const MyRequestActionType1 = 'my-action';
const MyResponseErrorAction1 = {type: 'my-action-error'};
const requestAction = createRequestAction(
    {type: MyRequestActionType1},
    undefined,
    MyResponseErrorAction1
);

const dispatch = async () => {
    try {
        const response = await store.dispatch(requestAction);
    
        console.log('awaited response', response);
    } catch (e) {
        console.log('error while executing', e.rejectAction);
    }
};

store.subscribeToActions(MyRequestActionType1).addListener((action) => {
    console.log('request action', action)
    store.dispatch(MyResponseErrorAction1);
});

dispatch();
```

logs:
```
request action {
    type: 'my-action',
    payload: 1
}

error while executing { type: 'my-action-error' }
```

timeout a request action

```typescript
const requestAction = createRequestAction(
    {type: MyRequestActionType1}, 
    MyResponseAction1,
    undefined,
    100
);
store.dispatch(requestAction)
    .catch((error: TimeoutError) => console.log(error.name, error.message));
```
Logs `TimeoutError Timed out promise` after 100ms, the promise is reject with an `Error`


### Action Promises
Promises can be created from any enhanced redux store, that are resolved or rejected based on specified actions that 
will be dispatched in that store
```typescript
import ActionPromiseEnhancer, { ActionPromiseStore } from 'redux-action-promise-enhancer';

const MyActionType1 = 'my-action';
const MyAction2 = {type: 'my-action-2'};
const store: ActionPromiseStore = createStore(myReducer, ActionPromiseEnhancer);

const logAction = async () => {
    console.log(await store.promise([MyActionType1, MyAction2]));
};

store.dispatch({
    type: MyActionType1,
    payload: 1
});

store.dispatch(MyAction2);

logAction();

store.dispatch({
    type: MyAction1,
    payload: 2
});

store.dispatch(MyAction2);
```

logs:
```
{
    type: 'my-action',
    payload: 2
}

{ type: 'my-action-2' }
```

If you want to reject the promise on a certain action, the action promise will be rejected with that action

```typescript
const MyRejectAction1 = 'my-reject-action';
const store: ActionPromiseStore = createStore(myReducer, ActionPromiseEnhancer);
const logPromise = async () => {
    try {
        console.log(await store.promise([], [MyRejectAction1]))
    } catch (e: RejectActionErrorError) {
        console.log(e.rejectAction)
    }
};
logPromise();
store.dispatch({
    type: MyRejectAction1
});
```
logs `{type: 'my-reject-action'}`

Using the return promise object:

```typescript
import ActionPromiseEnhancer, { ActionPromiseStore } from 'redux-action-promise-enhancer';

const MyAction1 = 'my-action';
const store: ActionPromiseStore = createStore(myReducer, ActionPromiseEnhancer);

const promise = store.promise([MyAction1]);
promise.then((action) => console.log(action));

store.dispatch({
    type: MyAction1,
    payload: 1
});
store.dispatch({
    type: MyAction1,
    payload: 2
});
```

logs:
```
{
    type: 'my-action',
    payload: 1
}
```

Promises can also be canceled, like so:
```typescript
const promise = store.promise([MyAction1]);
promise.then((action) => console.log(action));
promise.cancel();
store.dispatch({
    type: MyAction1,
    payload: 1
});
```
logs:
```
```

If you want to specify a timeout for the generated promise, you can do that in ms as the final parameter of the promise method

```typescript
const store: ActionPromiseStore = createStore(myReducer, ActionPromiseEnhancer);
const promise = store.promise([MyAction1], [], 100);
promise.catch((error: TimeoutError) => console.log(error.name, error.message));
```
Logs `TimeoutError Timed out promise` after 100ms, the promise is reject with an `Error`

### Action Subscriptions
Subscriptions are used if you want to listen to one action type dispatching in a store, you can subscribe to any action 
that is dispatched in the store using this method, and listen for an action.
```typescript
import ActionPromiseEnhancer, { ActionPromiseStore } from 'redux-action-promise-enhancer';

const MyAction1 = 'my-action';
const store: ActionPromiseStore = createStore(myReducer, ActionPromiseEnhancer);
const { addListener, unsubscribe } = store.subscribeToActions([MyAction1]);

addListener((action) => console.log('log 1', action));
const listener2 = addListener((action) => console.log('log 2', action));

store.dispatch({
    type: MyAction1,
    payload: 1
});

listener2.remove();

store.dispatch({
    type: MyAction1,
    payload: 2
});

unsubscribe();

store.dispatch({
    type: MyAction1,
    payload: 3
});
```
logs:
```
log 1 {
    type: 'my-action',
    payload: 1
}

log 2 {
    type: 'my-action',
    payload: 1
}

log 1 {
    type: 'my-action',
    payload: 2
}
```

You can also use action creator functions or action objects for any action array

```typescript
import ActionPromiseEnhancer, { ActionPromiseStore } from 'redux-action-promise-enhancer';

const MyActionCreator1 = (payload) => {type: 'my-action', payload};
const store: ActionPromiseStore = createStore(myReducer, ActionPromiseEnhancer);
const { addListener, unsubscribe } = store.subscribeToActions([MyActionCreator1]);

addListener((action) => console.log(action));

store.dispatch(MyActionCreator1(1));
```
logs:
```
{
    type: 'my-action',
    payload: 1
}
```

### Action Queue
A queue is used when you want actions to execute in a certain order in the store, so you can create a queue and dispatch 
the actions in the queue, waiting for end actions.

```typescript
import ActionPromiseEnhancer, { ActionPromiseStore } from 'redux-action-promise-enhancer';

// creating a queue
const store: ActionPromiseStore = createStore(myReducer, ActionPromiseEnhancer);
const queue = store.createActionQueue();
```

Queueing multiple actions, with start and end action
```typescript
// setup actions
const startAction1 = {type: 'startAction1'};
const endAction1 = {type: 'endAction1'};
const startAction2 = {type: 'startAction2'};
const endAction2 = {type: 'endAction2'};
const startAction3 = {type: 'startAction3'};
const endAction3 = {type: 'endAction3'};
const finalAction = {type: 'finalAction'};

// setup action listeners for logging
const { addListener: startAddListener1 } = store.subscribeToActions([startAction1]);
startAddListener1((action) => console.log(action));
const { addListener: endAddListener1 } = store.subscribeToActions([endAction1]);
endAddListener1((action) => console.log(action));
const { addListener: startAddListener2 } = store.subscribeToActions([startAction2]);
startAddListener2((action) => console.log(action));
const { addListener: endAddListener2 } = store.subscribeToActions([endAction2]);
endAddListener2((action) => console.log(action));
const { addListener: startAddListener3 } = store.subscribeToActions([startAction3]);
startAddListener3((action) => console.log(action));
const { addListener: endAddListener3 } = store.subscribeToActions([endAction3]);
endAddListener3((action) => console.log(action));
const { addListener: addListenerFinal } = store.subscribeToActions([finalAction]);
addListenerFinal((action) => console.log(action));

// queue up actions
queue.dispatch(startAction1, endAction1);
queue.dispatch(startAction2, endAction2);
queue.dispatch(startAction3, endAction3);
queue.dispatch(finalAction);

// dispatch the ending actions
store.dispatch(endAction3);
store.dispatch(endAction2);
store.dispatch(endAction1);
store.dispatch(endAction2);
store.dispatch(endAction1);
store.dispatch(endAction3);
```
logs:
```
{type: 'startAction1'}
{type: 'endAction3'}
{type: 'endAction2'}
{type: 'endAction1'}
{type: 'startAction2'}
{type: 'endAction2'}
{type: 'startAction3'}
{type: 'endAction1'}
{type: 'endAction3'}
{type: 'finalAction'}
```
Respects priority
```typescript
// setup actions
const startAction1 = {type: 'startAction1'};
const endAction1 = {type: 'endAction1'};
const startAction2 = {type: 'startAction2'};
const endAction2 = {type: 'endAction2'};
const startAction3 = {type: 'startAction3'};
const endAction3 = {type: 'endAction3'};
const finalAction = {type: 'finalAction'};

// setup action listeners for logging
const { addListener: startAddListener1 } = store.subscribeToActions([startAction1]);
startAddListener1((action) => console.log(action));
const { addListener: endAddListener1 } = store.subscribeToActions([endAction1]);
endAddListener1((action) => console.log(action));
const { addListener: startAddListener2 } = store.subscribeToActions([startAction2]);
startAddListener2((action) => console.log(action));
const { addListener: endAddListener2 } = store.subscribeToActions([endAction2]);
endAddListener2((action) => console.log(action));
const { addListener: startAddListener3 } = store.subscribeToActions([startAction3]);
startAddListener3((action) => console.log(action));
const { addListener: endAddListener3 } = store.subscribeToActions([endAction3]);
endAddListener3((action) => console.log(action));
const { addListener: addListenerFinal } = store.subscribeToActions([finalAction]);
addListenerFinal((action) => console.log(action));

// queue up actions
queue.dispatch(startAction1, endAction1, undefined, 3);
queue.dispatch(startAction3, endAction3, undefined, 1);
queue.dispatch(startAction2, endAction2, undefined, 2);
queue.dispatch(finalAction);

// dispatch the ending actions
store.dispatch(endAction1);
store.dispatch(endAction2);
store.dispatch(endAction3);
```
logs:
```
{type: 'startAction1'}
{type: 'endAction1'}
{type: 'startAction2'}
{type: 'endAction2'}
{type: 'startAction3'}
{type: 'endAction3'}
{type: 'finalAction'}
```
Multiple queues
```typescript
const queue1 = store.createActionQueue();
const queue2 = store.createActionQueue();

//action setup
const startAction1 = {type: 'startAction1'};
const startAction2 = {type: 'startAction2'};

//single end action
const endAction = {type: 'endAction'};

//multiple final actions
const finalAction1 = {type: 'finalAction1'};
const finalAction2 = {type: 'finalAction2'};

//add listeners
const { addListener: startAddListener1 } = store.subscribeToActions([startAction1]);
startAddListener1((action) => console.log(action));
const { addListener: finalAddListener1 } = store.subscribeToActions([finalAction1]);
finalAddListener1((action) => console.log(action));
const { addListener: startAddListener2 } = store.subscribeToActions([startAction2]);
startAddListener2((action) => console.log(action));
const { addListener: finalAddListener2 } = store.subscribeToActions([finalAction2]);
finalAddListener2((action) => console.log(action));
const { addListener: endAddListener } = store.subscribeToActions([endAction]);
endAddListener((action) => console.log(action));

//queue actions
queue1.dispatch(startAction1, endAction);
queue1.dispatch(finalAction1);

queue2.dispatch(startAction2, endAction);
queue2.dispatch(finalAction2);

//dispatch end action
store.dispatch(endAction);
```
logs:
```
{type: 'startAction1'}
{type: 'startAction2'}
{type: 'endAction'}
{type: 'finalAction1'}
{type: 'finalAction2'}
```
You can also use request actions in a queue

```typescript
import {createAction} from "@reduxjs/toolkit";

//setup
const queue = store.createActionQueue();
const endAction1 = createAction('endAction1');
const requestAction1 = createRequestAction(createAction('startAction1'), endAction1);
const endAction2 = createAction('endAction2');
const requestAction2 = createRequestAction(createAction('startAction2'), endAction2);
const finalAction = createAction('finalAction');

//queue items
queue.dispatch(requestAction1);
const requestActionPromise = queue.dispatch(requestAction2);
queue.dispatch(finalAction);

//setup listeners
const { addListener: startAddListener1 } = store.subscribeToActions([requestAction1]);
startAddListener1((action) => console.log(action));
const { addListener: endAddListener1 } = store.subscribeToActions([endAction1]);
endAddListener1((action) => console.log(action));
const { addListener: startAddListener2 } = store.subscribeToActions([requestAction2]);
startAddListener2((action) => console.log(action));
const { addListener: endAddListener2 } = store.subscribeToActions([endAction2]);
endAddListener2((action) => console.log(action));
const { addListener: finalAddListener } = store.subscribeToActions([finalAction]);
finalAddListener((action) => console.log(action));

requestActionPromise.then(() => {
    console.log('request action 2 finished');
});

//dispatch end actions
store.dispatch(endAction1);
store.dispatch(endAction2);
```
logs:
```
{type: 'startAction1'}
{type: 'startAction2'}
{type: 'endAction1'}
{type: 'endAction2'}
request action 2 finished
{type: 'finalAction'}
```
Canceling queued actions
```typescript
const startAction1 = {type: 'startAction1'};
const endAction1 = {type: 'endAction1'};
const startAction2 = {type: 'startAction2'};
const endAction2 = {type: 'endAction2'};
const startAction3 = {type: 'startAction3'};
const endAction3 = {type: 'endAction3'};
const finalAction = {type: 'finalAction'};

// setup action listeners for logging
const { addListener: startAddListener1 } = store.subscribeToActions([startAction1]);
startAddListener1((action) => console.log(action));
const { addListener: endAddListener1 } = store.subscribeToActions([endAction1]);
endAddListener1((action) => console.log(action));
const { addListener: startAddListener2 } = store.subscribeToActions([startAction2]);
startAddListener2((action) => console.log(action));
const { addListener: endAddListener2 } = store.subscribeToActions([endAction2]);
endAddListener2((action) => console.log(action));
const { addListener: startAddListener3 } = store.subscribeToActions([startAction3]);
startAddListener3((action) => console.log(action));
const { addListener: endAddListener3 } = store.subscribeToActions([endAction3]);
endAddListener3((action) => console.log(action));
const { addListener: addListenerFinal } = store.subscribeToActions([finalAction]);
addListenerFinal((action) => console.log(action));

// queue up actions
const promise1 = queue.dispatch(startAction1, endAction1);
const promise2 = queue.dispatch(startAction2, endAction2);
const promise3 = queue.dispatch(startAction3, endAction3);
const promise4 = queue.dispatch(finalAction);

// log when promises execute
promise1.then(() => console.log('action1 finished'));
promise2.then(() => console.log('action2 finished'));
promise3.then(() => console.log('action3 finished'));
promise4.then(() => console.log('finalAction finished'));

// cancel the 3th action
promise3.cancel();

//dispatch end actions
store.dispatch(endAction1);
store.dispatch(endAction2);
store.dispatch(endAction3);
```
logs:
```
{type: 'startAction1'}
{type: 'endAction1'}
action1 finished
{type: 'startAction2'}
{type: 'endAction2'}
action2 finished
{type: 'finalAction'}
finalAction finished
{type: 'endAction3'}
```
Canceling queued action while executing it
```typescript
const startAction1 = {type: 'startAction1'};
const endAction1 = {type: 'endAction1'};
const startAction2 = {type: 'startAction2'};
const endAction2 = {type: 'endAction2'};
const startAction3 = {type: 'startAction3'};
const endAction3 = {type: 'endAction3'};
const finalAction = {type: 'finalAction'};

// setup action listeners for logging
const { addListener: startAddListener1 } = store.subscribeToActions([startAction1]);
startAddListener1((action) => console.log(action));
const { addListener: endAddListener1 } = store.subscribeToActions([endAction1]);
endAddListener1((action) => console.log(action));
const { addListener: startAddListener2 } = store.subscribeToActions([startAction2]);
startAddListener2((action) => console.log(action));
const { addListener: endAddListener2 } = store.subscribeToActions([endAction2]);
endAddListener2((action) => console.log(action));
const { addListener: startAddListener3 } = store.subscribeToActions([startAction3]);
startAddListener3((action) => console.log(action));
const { addListener: endAddListener3 } = store.subscribeToActions([endAction3]);
endAddListener3((action) => console.log(action));
const { addListener: addListenerFinal } = store.subscribeToActions([finalAction]);
addListenerFinal((action) => console.log(action));

// queue up actions
const promise1 = queue.dispatch(startAction1, endAction1);
const promise2 = queue.dispatch(startAction2, endAction2);
const promise3 = queue.dispatch(startAction3, endAction3);
const promise4 = queue.dispatch(finalAction);

// log when promises execute
promise1.then(() => console.log('action1 finished'));
promise2.then(() => console.log('action2 finished'));
promise3.then(() => console.log('action3 finished'));
promise4.then(() => console.log('finalAction finished'));

//dispatch end actions
store.dispatch(endAction1);
// cancel the 2nd action
promise2.cancel();
store.dispatch(endAction2);
store.dispatch(endAction3);
```
logs:
```
{type: 'startAction1'}
{type: 'endAction1'}
action1 finished
{type: 'startAction2'}
{type: 'startAction3'}
{type: 'endAction2'}
{type: 'endAction3'}
action3 finished
{type: 'finalAction'}
finalAction finished
```
Pausing and resuming the queue
```typescript
// setup actions
const startAction1 = {type: 'startAction1'};
const endAction1 = {type: 'endAction1'};
const startAction2 = {type: 'startAction2'};
const endAction2 = {type: 'endAction2'};
const startAction3 = {type: 'startAction3'};
const endAction3 = {type: 'endAction3'};
const finalAction = {type: 'finalAction'};

// setup action listeners for logging
const { addListener: startAddListener1 } = store.subscribeToActions([startAction1]);
startAddListener1((action) => console.log(action));
const { addListener: endAddListener1 } = store.subscribeToActions([endAction1]);
endAddListener1((action) => console.log(action));
const { addListener: startAddListener2 } = store.subscribeToActions([startAction2]);
startAddListener2((action) => console.log(action));
const { addListener: endAddListener2 } = store.subscribeToActions([endAction2]);
endAddListener2((action) => console.log(action));
const { addListener: startAddListener3 } = store.subscribeToActions([startAction3]);
startAddListener3((action) => console.log(action));
const { addListener: endAddListener3 } = store.subscribeToActions([endAction3]);
endAddListener3((action) => console.log(action));
const { addListener: addListenerFinal } = store.subscribeToActions([finalAction]);
addListenerFinal((action) => console.log(action));

// queue up actions
queue.dispatch(startAction1, endAction1);
queue.dispatch(startAction2, endAction2);
queue.dispatch(startAction3, endAction3);
queue.dispatch(finalAction);

// dispatch the ending actions
store.dispatch(endAction1);
queue.pauseQueue();
console.log('queue paused');
store.dispatch(endAction2);
store.dispatch(endAction3);
queue.resumeQueue();
console.log('queue resumed');
store.dispatch(endAction3);
```
logs:
```
{type: 'startAction1'}
{type: 'endAction1'}
{type: 'startAction2'}
queue paused
{type: 'endAction2'}
{type: 'endAction3'}
queue resumed
{type: 'startAction3'}
{type: 'endAction3'}
{type: 'finalAction'}
```
### Validation Mode:

The action promise enhancer validates the input it is given on each function, this ensures unique inputs of actions to avoid duplication entries or similar errors.

To disable this you can set the validation mode to 'compiletime' like so:

```typescript
import ActionPromiseEnhancer, { ValidationMode } from 'redux-action-promise-enhancer';

ActionPromiseEnhancer.validationMode = ValidationMode.COMPILETIME;
```

note: you can only do this before the ActionPromiseEnhancer is used by a redux store, and will be used as a configuration for the app.

### Plain JS example:

```javascript
const MyAction1 = 'my-action';
const store = createStore(myReducer, ActionPromiseEnhancer);
const promise = store.promise([MyAction1]);
promise.then((action) => console.log(action));
store.dispatch({
    type: MyAction1
});
```
logs `{type: 'my-action'}`

## License

[MIT](LICENSE)

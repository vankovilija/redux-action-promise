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


### Handling Action Promises
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

### Handling Action Subscriptions
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

[MIT](LICENSE.md)

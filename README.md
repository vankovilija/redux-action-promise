# Redux Action Promise
Create a promise from a redux store and a list of expected actions that will resolve in the future

##Usage

###importing
```typescript
import ActionPromiseEnhancer from 'redux-action-promise';
```

or

```typescript
import { ActionPromiseEnhancer } from 'redux-action-promise';
```

using require

```typescript
const ActionPromiseEnhancer = require('redux-action-promise').default;
```

###Composing with a redux store

Creation
```typescript
const store: ActionPromiseStore = createStore(myReducer, ActionPromiseEnhancer);
```
if you have multiple enhancers, simply using the redux <a href="https://redux.js.org/api/compose/">compose</a> functionality
```typescript
const store: ActionPromiseStore = createStore(myReducer, compose(ActionPromiseEnhancer, ...otherEnhancers));
```
Handling Actions
```typescript
import ActionPromiseEnhancer, { ActionPromiseStore } from 'redux-action-promise';

const MyAction1 = 'my-action';
const store: ActionPromiseStore = createStore(myReducer, ActionPromiseEnhancer);
const promise = store.promise([MyAction1]);
promise.then((action) => console.log(action));
store.dispatch({
    type: MyAction1
});
```
logs `{type: 'my-action'}`

If you want to reject the promise on a certain action, the action promise will be rejected with that action

```typescript
const MyRejectAction1 = 'my-reject-action';
const store: ActionPromiseStore = createStore(myReducer, ActionPromiseEnhancer);
const promise = store.promise([], [MyRejectAction1]);
promise.catch((action) => console.log(action));
store.dispatch({
    type: MyRejectAction1
});
```
logs `{type: 'my-reject-action'}`

If you want to specify a timeout for the generated promise, you can do that in ms as the final parameter of the promise method

```typescript
const store: ActionPromiseStore = createStore(myReducer, ActionPromiseEnhancer);
const promise = store.promise([], [], 100);
promise.catch((error) => console.log(error.name, error.message));
```
Logs `TimeoutError Timed out promise` after 100ms, the promise is reject with an `Error`

Plain JS example:

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
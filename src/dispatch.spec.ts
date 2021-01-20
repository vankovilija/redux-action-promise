import { dispatch as dispatchFactory } from './dispatch';
import { createResponseAction } from './create-response-action';

describe('dispatch function that can be alter its return by input params', () => {

    let activeSubscriptionsIndex, promiseFunction, dispatchFunction, thePromise, dispatch;
    beforeEach(() => {
        activeSubscriptionsIndex = {};
        thePromise = Promise.resolve();
        promiseFunction = jest.fn(() => thePromise);
        dispatchFunction = jest.fn((action) => action);
        dispatch = dispatchFactory(activeSubscriptionsIndex, promiseFunction, dispatchFunction);
    });

    it ('returns the input action as long as the action used is a normal redux action', () => {
        const action = {
            type: 'testAction',
            payload: 1
        };
        const returnValue = dispatch(action);

        expect(dispatchFunction).toBeCalledTimes(1);
        expect(dispatchFunction.mock.calls[0][0]).toBe(action);
        expect(promiseFunction).not.toBeCalled();
        expect(returnValue).toBe(action);
    });

    it ('returns a promise if called with special input', () => {
        const promise = {
            resolveActions: ['action1'],
            rejectActions: ['action2'],
            timeout: 10
        };
        const action = createResponseAction({
            type: 'action',
            payload: 1
        }, promise.resolveActions, promise.rejectActions, promise.timeout);
        const returnValue = dispatch(action);

        expect(dispatchFunction).toBeCalledTimes(1);
        expect(dispatchFunction.mock.calls[0][0]).toBe(action);

        expect(promiseFunction).toBeCalledTimes(1);
        expect(promiseFunction.mock.calls[0][0]).toBe(promise.resolveActions);
        expect(promiseFunction.mock.calls[0][1]).toBe(promise.rejectActions);
        expect(promiseFunction.mock.calls[0][2]).toBe(promise.timeout);

        expect(returnValue).toBe(thePromise);
    });

});
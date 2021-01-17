import {processAction} from './process-action';

describe('internal function to process redux actions', () => {
    const positiveFn1 = jest.fn();
    const positiveFn2 = jest.fn();
    const positiveFn3 = jest.fn();
    const negativeFn1 = jest.fn();
    const negativeFn2 = jest.fn();
    const negativeFn3 = jest.fn();
    const negativeFn4 = jest.fn();
    const negativeFn5 = jest.fn();
    const positiveActionType = 'action1';
    const negativeActionType1 = 'action2';
    const negativeActionType2 = 'action3';
    const unknownActionType = 'action4';
    const activeSubscriptionsIndex = {
        [positiveActionType]: [[positiveFn1, positiveFn2], [positiveFn3]],
        [negativeActionType1]: [[negativeFn1, negativeFn2], [negativeFn3]],
        [negativeActionType2]: [[negativeFn4], [negativeFn5]]
    };

    it ('calls all functions in the array function of the active subscription index that match a given action type', () => {
        const action = {
            type: positiveActionType
        };

        const returnValue = processAction(activeSubscriptionsIndex, action);

        expect(positiveFn1).toBeCalledWith(action);
        expect(positiveFn2).toBeCalledWith(action);
        expect(positiveFn3).toBeCalledWith(action);

        expect(negativeFn1).not.toBeCalled();
        expect(negativeFn2).not.toBeCalled();
        expect(negativeFn3).not.toBeCalled();
        expect(negativeFn4).not.toBeCalled();
        expect(negativeFn5).not.toBeCalled();

        expect(returnValue).toBe(undefined);
    });

    it ('skips any execution if there is no matching action in the active subscriptions index', () => {
        const action = {
            type: unknownActionType
        };

        expect(processAction(activeSubscriptionsIndex, action)).toBe('skipped');
    });
});
import { ValidationMode } from '../enhancer';
import { createAction } from '@reduxjs/toolkit';
import { subscribe as subFn } from './subscribe';
import { subscribeToActions } from './subscribe-to-actions';

jest.mock('./subscribe');

describe('subscribeToActions', () => {

    let activeSubscriptionIndex, subscribe, actions;
    const action1 = 'action1';
    const action2 = 'action2';
    const action3 = 'action3';
    beforeEach(() => {
        activeSubscriptionIndex = {};
        actions = [action1, createAction(action2), {type: action3}];
        subscribe = subscribeToActions(ValidationMode.COMPILETIME, activeSubscriptionIndex);
    });

    it ('normalises input and can work with higher order action types, action creator and action object', () => {
        subscribe(actions);
        expect(subFn).toBeCalledTimes(1);
        expect((subFn as any).mock.calls[0][1]).toEqual([action1, action2, action3]);
    });

    it ('works with only one action', () => {
        subscribe(action1);
        expect(subFn).toBeCalledTimes(2);
        expect((subFn as any).mock.calls[1][1]).toEqual([action1]);
    });

    afterAll(() => {
        jest.unmock('./subscribe');
    })
});
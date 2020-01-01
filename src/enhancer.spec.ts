import { createStore } from 'redux';
import { ActionPromiseEnhancer } from './enhancer';
import { ActionPromiseStore } from './action-promise-store.interface';

describe('ActionPromiseEnhancer', () => {
    let store: ActionPromiseStore;
    beforeEach(() => {
        store = createStore((store) => store, ActionPromiseEnhancer)
    });
    it('exposes a method to create a promise', () => {
        expect(typeof store.promise === 'function').toBeTruthy();
    });
    it('returns a promise when the promise method is called', () => {
        const p = store.promise([]);
        expect(typeof p.then === 'function').toBeTruthy();
        expect(typeof p.catch === 'function').toBeTruthy();
    });
    it ('resolves the promise when the proper action is dispatched', () => {
        const p = store.promise(['testAction'])
        const action = {
            type: 'testAction'
        };
        store.dispatch(action);
        return expect(p).resolves.toEqual(action);
    });
    it ('rejects the promise when the proper action is dispatched', () => {
        const p = store.promise([], ['testAction'])
        const action = {
            type: 'testAction'
        };
        store.dispatch(action);
        return expect(p).rejects.toEqual(action);
    });
    it ('times out if a timeout is specified', () => {
        const p = store.promise(['testAction'], [], 100)
        const action = {
            type: 'testAction'
        };
        setTimeout(() => {
            store.dispatch(action);
        }, 150);
        // @ts-ignore
        return Promise.all([
            expect(p).rejects.toHaveProperty('name', 'TimeoutError'),
            expect(p).rejects.toHaveProperty('message', 'Timed out promise')
        ]);
    });
})
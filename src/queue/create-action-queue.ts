import {DispatchFunction} from '../action-promise-store.interface';
import {Action, AnyAction} from 'redux';
import {QueueType} from './queue.interface';
import {DispatchInQueue, dispatchInQueue} from './dispatch-in-queue';
import {QueueState} from './queue-state.enum';
import {PauseQueue, pauseQueue} from './pause-queue';
import {ResumeQueue, resumeQueue} from './resume-queue';
import {processQueue} from './process-queue';

export type ActionQueue<A extends Action = AnyAction> = {
    dispatch: DispatchInQueue<A>,
    pauseQueue: PauseQueue,
    resumeQueue: ResumeQueue
}

export type CreateActionQueue<A extends Action = AnyAction> = () => ActionQueue<A>

export const createActionQueue = <A extends Action = AnyAction>(
    dispatchFunction: DispatchFunction<A>
) => {
    return () => {
        const queueOfActions:QueueType = {
            items: [],
            state: QueueState.WAITING
        };
        const processFunction = processQueue(queueOfActions, dispatchFunction);
        return {
            dispatch: dispatchInQueue<A>(queueOfActions, processFunction),
            pauseQueue: pauseQueue(queueOfActions),
            resumeQueue: resumeQueue(queueOfActions, processFunction)
        }
    }
}
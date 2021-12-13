import {AnyTypeOfAction} from "./action-promise-store.interface";
import {isActionCreator} from "./subscribe-to-actions/is-action-creator.util";
import {isActionObject} from "./subscribe-to-actions/is-action-object.util";
import {Action, AnyAction} from "redux";

export function convertActionsToActionTypes<A extends Action = AnyAction>(actions: AnyTypeOfAction<A>[]) {
    return actions.map((action) => {
        if (isActionCreator(action)) {
            const executedAction = action();
            return executedAction.type;
        } else if (isActionObject(action)) {
            return action.type;
        }
        return action;
    });
}
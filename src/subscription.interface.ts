import {Action} from "redux";

interface Listener {
    remove: () => void
}

export interface Subscription {
    unsubscribe: () => void;
    addListener: (callback: (action: Action) => void) => Listener;
}
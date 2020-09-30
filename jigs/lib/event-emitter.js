class EventEmitter {
    constructor() {
        this.listeners = new Map();
    }

    on(type, listener) {
        let listeners = this.listeners.get(type);
        if(!listeners) {
            listeners = new Set();
            this.listeners.set(type, listeners);
        }
        listeners.add(listener);
    }

    off(type, listener) {
        const listeners = this.listeners.get(type);
        if(!listeners) return;
        listeners.delete(listener);
    }

    emit(type, ...args) {
        const listeners = this.listeners.get(type);
        if(!listeners) return;
        for(let listener of listeners) {
            listener(...args);
        }
    }
}

EventEmitter.sealed = false;
module.exports = EventEmitter;
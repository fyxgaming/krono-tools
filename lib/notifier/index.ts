import { EventEmitter } from 'events';

export abstract class Notifier extends EventEmitter {
    abstract listenAddress(address: string): Promise<void>;
    abstract listenKinds(kinds: string[]): Promise<void>;
    abstract listenOrigins(origins: string[]): Promise<void>;
}

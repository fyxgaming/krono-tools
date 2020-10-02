import { EventEmitter } from "events";
import WebSocket from 'isomorphic-ws';

export class WSClient extends EventEmitter {
    private socket: WebSocket;
    private channels: Set<string>;
    private lastIds = new Map<string, number>();

    constructor(private url: string, channels: string[] = []) {
        super();
        this.channels = new Set<string>(channels);
        this.socket = this.connect();
    }

    connect() {
        const socket = new WebSocket(this.url);
        socket.addEventListener('open', () => {
            socket.addEventListener('message', (e) => {
                const {id, channel, event, data} = JSON.parse(e.data);
                const lastId = this.lastIds.get(channel) || 0;
                if(id > lastId) this.lastIds.set(channel, id);
                this.emit(event, data);
            })
            Array.from(this.channels).forEach(channel => this.subscribe(channel));
            
        });
        socket.addEventListener('close', () => {
            this.socket = this.connect();
        });
        return socket;
    }

    subscribe(channelId, lastId) {
        this.channels.add(channelId);
        if(!this.socket || this.socket.readyState !== 1) return;
        this.socket.send(JSON.stringify({
            action: 'subscribe',
            channelId,
            lastId: lastId || this.lastIds.get(channelId) || null
        }));
    }

    unsubscribe(channelId) {
        this.channels.delete(channelId);
        if(!this.socket || this.socket.readyState !== 1) return;
        this.socket.send(JSON.stringify({
            action: 'unsubscribe',
            channelId
        }));
    }

}
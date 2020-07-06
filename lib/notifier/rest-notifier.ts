import { Notifier } from '.';
import querystring from 'querystring';
import EventSource from 'eventsource'

export class RestNotifier extends Notifier {
    private jigEvents: EventSource;
    private jigs = { kinds: [], origins: [] };

    constructor(private apiUrl: string) {
        super();
    }

    async listenAddress(address: string) {
        const sse = new EventSource(`${this.apiUrl}/notify/${address}`);
        sse.addEventListener('utxo', async (e: any) => {
            this.emit('utxo', e.data);
        });
        sse.addEventListener('channel', async (e: any) => {
            this.emit('channel', e.data);
        });
    }

    async listenJigs() {
        if (this.jigEvents) this.jigEvents.close();
        const qs = querystring.stringify(this.jigs);
        this.jigEvents = new EventSource(`${this.apiUrl}/notify/jigs/${Date.now()}?${qs}`);
        this.jigEvents.addEventListener('kind', async (e: any) => {
            this.emit('kind', e.data);
        });
        this.jigEvents.addEventListener('origin', async (e: any) => {
            this.emit('origin', e.data);
        });
    }

    async listenKinds(kinds: string[]) {
        this.jigs.kinds = kinds;
        this.listenJigs();
    }

    async listenOrigins(origins: string[]) {
        this.jigs.origins = origins;
        this.listenJigs();
    }
}

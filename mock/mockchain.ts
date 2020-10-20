import Run from '@kronoverse/run';
import { EventEmitter } from 'events';

export class Mockchain extends Run.Mockchain {
    events = new EventEmitter();
    txns = new Map<string, string>();
    fetch: (txid: string) => Promise<any>;
    utxos: (script: string) => Promise<any>;
    spends: (txid: string, vout: number) => Promise<any>;
    block: () => void;
    
    async broadcast(rawtx) {
        const txid = await super.broadcast(rawtx);
        this.txns.set(txid, rawtx);
        this.events.emit('txn', rawtx);
        return txid;
    }

    async fund(address, satoshis) {
        const txid = await super.fund(address, satoshis);
        const rawtx = await this.fetch(txid);
        this.events.emit('txn', rawtx);
        return txid;
    }
}

module.exports = Mockchain;
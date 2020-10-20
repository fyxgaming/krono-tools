const Run = require('@kronoverse/run');
const { EventEmitter } = require('events');

class Mockchain extends Run.Mockchain {
    constructor() {
        super();
        this.mempoolChainLimit = Number.MAX_VALUE;
        this.events = new EventEmitter();
        this.txns = new Map();
    }

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
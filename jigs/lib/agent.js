const EventEmitter = require('./event-emitter');

//fetch, ADDRESS, PAYMAIL, PUBKEY, bsv

class Agent extends EventEmitter {
    constructor(wallet, blockchain, storage, bsv, lib) {
        super();
        this.wallet = wallet;
        this.blockchain = blockchain;
        this.storage = storage;
        this.bsv = bsv;
        this.lib = lib;
        this.address = wallet.address;
        this.pubkey = wallet.pubkey;
        this.purse = wallet.purse;
        this.paymail = wallet.paymail;

        this.eventHandlers = new Map();
        this.jigHandlers = new Map();
        this.messageHandlers = new Map();
        this.kindSubHandlers = new Map();
        this.originSubHandlers = new Map();
        this.channelSubHandlers = new Map();

        this.queue = Promise.resolve();
        this.processCount = 0;
    }

    addToQueue(process, label = 'process') {
        const processCount = this.processCount++;
        console.time(`${processCount}-${label}`);
        const queuePromise = this.queue.then(process);
        this.queue = queuePromise
            .catch(e => console.error('Queue error', label, e.message, e.stack))
            .then(() => console.timeEnd(`${processCount}-${label}`));

        return queuePromise;
    }

    init() { }
    async onJig(jigData) {
        let handler = this.jigHandlers.get(jigData.kind);
        if (!handler) return;
        const jig = await this.wallet.loadJig(jigData.location);
        if (!jig) {
            console.log(`JIG: ${jigData.type} ${jigData.location} missing`);
            return;
        }
        await jig.sync();
        if (jig.location !== jigData.location) {
            console.log(`JIG: ${jigData.type} ${jigData.location} spent`);
        }
        await handler.bind(this)(jig);
    }

    async onMessage(message) {
        let handler = this.messageHandlers.get(message.subject);
        if (!handler) {
            console.log('No Handler:', message.subject);
            return;
        }
        return handler.bind(this)(message);
    }

    // async onKindSub(jigData) {
    //     let handler = this.kindSubHandlers.get(jigData.kind);
    //     if(!handler) return;
    //     const jig = await this.wallet.loadJig(jigData.location);
    //     if (!jig) {
    //         console.log(`JIG: ${jigData.type} ${jigData.location} missing`);
    //         return;
    //     }
    //     await jig.sync();
    //     if (jig.location !== jigData.location) {
    //         console.log(`JIG: ${jigData.type} ${jigData.location} spent`);
    //     }
    //     await handler.bind(this)(jig);
    // }
    // async onOriginSub(jigData) {
    //     let handler = this.kindSubHandlers.get(jigData.kind);
    //     if(!handler) return;
    //     const jig = await this.wallet.loadJig(jigData.location);
    //     if (!jig) {
    //         console.log(`JIG: ${jigData.type} ${jigData.location} missing`);
    //         return;
    //     }
    //     await jig.sync();
    //     if (jig.location !== jigData.location) {
    //         console.log(`JIG: ${jigData.type} ${jigData.location} spent`);
    //     }
    //     await handler.bind(this)(jig);
    // }

    // async onChannelSub(channel) {
    //     let handler = this.channelSubHandlers.get(channel.loc);
    //     if(!handler) return;
    //     await this.wallet.loadChannelTransaction(channel.loc, channel.seq, async jig => {
    //         return handler.bind(this)(jig);
    //     });
    // }

    async onEvent(event, payload) {
        let handler = this.eventHandlers.get(event);
        if (!handler) throw new Error('Invalid handler:', event);
        return handler.bind(this)(payload);
    }

    async schedule(id, time, event, payload) {
        await this.storage.multi()
            .hset('timeouts', id, time)
            .hmset(`timeout:${id}`, {
                event,
                payload: payload && JSON.stringify(payload),
            })
            .exec();
    }

    async setTimeout(id, timeout, event, payload) {
        await this.storage.multi()
            .hset('timeouts', id, this.wallet.now + timeout)
            .hmset(`timeout:${id}`, {
                event,
                payload: payload && JSON.stringify(payload),
            })
            .exec();
    }

    async clearTimeout(id) {
        this.storage.multi()
            .hdel('timeouts', id)
            .del(`timeout:${id}`)
            .exec();
    }

    async setInterval(interval, event, payload) {
        const id = `${event}|${interval}`;
        await this.storage.multi()
            .hset('intervals', id, 0)
            .hmset(id, {
                event,
                payload: payload && JSON.stringify(payload),
            })
            .exec();
    }

    async clearInterval(interval, event) {
        const id = `${event}|${interval}`;
        this.storage.multi()
            .hdel('intervals', id)
            .del(id)
            .exec();
        this.storage.del(id);
    }

    static hexToBytes(hex) {
        let bytes = new Uint8Array(32);
        for (let i = 0; i < 64; i += 2) {
            bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
        }
        return bytes;
    }

    generateHashchain(size) {
        const hashchain = [];
        // const hashchain = new Array(size);
        let hash = hashchain[size - 1] = this.wallet.randomBytes(32);
        for (let i = size - 2; i >= 0; i--) {
            hash = hashchain[i] = Sha256.hashToHex(Agent.hexToBytes(hash));
        }
        return hashchain
    }
}

Agent.asyncDeps = {
    EventEmitter: 'lib/event-emitter.js',
    Sha256: "lib/sha256.js"
}

Agent.sealed = false;

module.exports = Agent;
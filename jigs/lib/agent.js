const EventEmitter = require('./event-emitter');

//fetch, ADDRESS, PAYMAIL, PUBKEY, bsv

class Agent extends EventEmitter {
    // EVENTS: schedule, client, 

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
    async onChannel(channe) { }

    async onMessage(message) {
        let handler = this.messageHandlers.get(message.subject);
        if (!handler) return;
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
        if (!handler) throw new Error('Invalid handler');
        return handler.bind(this)(payload);
    }

    async setTimeout(timeout, event, payload) {
        await this.storage.multi()
            .hset('timeouts', id, this.wallet.now + timeout)
            .hmset(id, {
                event,
                payload: payload && JSON.stringify(payload),
            })
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

    async processScheduler() {
        const timeouts = await this.storage.hgetall('timeouts');
        for (const [id, timeout] of Object.entries(timeouts)) {
            if (timeout < this.wallet.now()) continue;
            const handler = await this.storage.hgetall(id);
            try {
                await this.onEvent(handler.event, handler.payload && JSON.parse(handler.payload));
                await this.storage.multi()
                    .hdel('timeouts', id)
                    .del(id)
                    .exec();
            } catch (e) {
                console.error('Timeout Error', handler.event, e);
                await this.storage.hmset(id, {
                    error: e.message,
                    errorCount: (handler.errorCount || 0) + 1
                });
            }
        }

        const intervals = await this.storage.hgetall('intervals');
        for (const [id, lastRun] of Object.entries(intervals)) {
            const [interval] = id.split('|').slice(-1);
            if (lastRun > this.wallet.now - interval) continue;
            const handler = await this.storage.hgetall(id);
            try {
                await this.onEvent(handler.event, handler.payload && JSON.parse(handler.payload));
                await this.storage.hset('intervals', id, this.wallet.now);
            } catch (e) {
                console.error('Interval Error', id, e);
            }
        }
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

module.exports = Agent;
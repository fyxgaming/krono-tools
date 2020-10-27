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

        this.handled = new Set();
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
        if(this.handled.has(jigData.location)) return;
        this.handled.add(jigData.location);
        let handler = this.jigHandlers.get(jigData.kind);
        if (!handler) return;
        const label = `${this.processCount++}-jig-${jigData.type}-${jigData.location}`;
        try {
            console.time(label);
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
        } finally {
            console.timeEnd(label);
        }
    }

    async onMessage(message) {
        if(this.handled.has(message.id)) return;
        this.handled.add(message.id);
        let handler = this.messageHandlers.get(message.subject);
        if (!handler) {
            console.log('No Handler:', message.subject);
            return;
        }
        const label = `${this.processCount++}-msg-${message.subject}-${message.id}`;
        try {
            console.time(label);
            const result = await handler.bind(this)(message);
            return result;
        } finally {
            console.timeEnd(label);
        }
    }

    async onEvent(event, payload) {
        let handler = this.eventHandlers.get(event);
        if (!handler) throw new Error('Invalid handler:', event);
        const label = `${this.processCount++}-event-${event}`;
        try {
            console.time(label);
            const result = await handler.bind(this)(payload);
            return result;
        } finally {
            console.timeEnd(label);
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

Agent.sealed = false;

module.exports = Agent;
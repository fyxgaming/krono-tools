const CashierConfig = require('../config/dev/cashier-config');
const EventEmitter = require('./event-emitter');
const { Group } = require('run-sdk').extra;

/* global KronoCoin, KronoError, Sha256 */
class Agent extends EventEmitter {
    constructor(wallet, blockchain, storage, bsv, lib) {
        super();
        this.wallet = wallet;
        this.blockchain = blockchain;
        this.storage = storage;
        this.bsv = bsv;
        this.lib = lib;
        this.address = wallet.address;
        const lock = new Group(
            [this.wallet.ownerPair.pubKey.toString(), CashierConfig.pubkey],
            2
        );
        this.coinScript = lock.script();
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
            const [txid, vout] = jigData.location.split('o_');
            const spend = await this.blockchain.spends(txid, vout);
            if(spend) {
                console.log(`JIG: ${jigData.type} ${jigData.location} spent`);
                return;
            }
            // await jig.sync();
            // if (jig.location !== jigData.location) {
            //     console.log(`JIG: ${jigData.type} ${jigData.location} spent`);
            // }
            await handler.bind(this)(jig);
        } finally {
            console.timeEnd(label);
        }
    }

    async onMessage(message, ipAddress) {
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
            const result = await handler.bind(this)(message, ipAddress);
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
        return hashchain;
    }

    async getCoins(ownerScript) {
        return this.blockchain.jigIndex(
            ownerScript, 
            {criteria: {kind: KronoCoin.origin}},
            'script'
        );
    }

    async selectCoins(amount, ownerScript) {
        const coins = [];
        let acc = 0;
        for(let coinData of await this.getCoins(ownerScript || this.coinScript)) {
            if(acc >= amount) break;
            const coin = await this.wallet.loadJig(coinData.location);
            coins.push(coin);
            acc += coin.amount;
        }
        if (acc < amount) throw new KronoError(402, 'Insufficient balance');
        return coins;
    }

    async getBalance(ownerScript) {
        console.log('getBalance');
        const coinIndex = await this.getCoins(ownerScript || this.coinScript);
        const balance = coinIndex.reduce((acc, coin) => acc + coin.value.amount, 0);
        console.log('Balance', balance);
        return balance;
    }

    async pickAndLock(jigs, lockSeconds = 120) {
        const now = this.wallet.now;
        for(let j of jigs) {
            console.log('Jig:', j.location);
            if(await this.storage.exists(`lock:${j.location}`)) {
                console.log('Locked:', j.location);
                continue;
            }
            await this.storage.pipeline()
                .set(`lock:${j.location}`, now.toString())
                .expire(`lock:${j.location}`, lockSeconds)
                .exec();
            const jig = await this.wallet.loadJig(j.location);
            return jig;
        }
    }


    async cashout(ownerScript, paymentAmount, deviceGPS) {
        const message = this.wallet.buildMessage({
            subject: 'CashoutRequest',
            payload: JSON.stringify({
                paymentAmount,
                ownerScript
            })
        });

        const cashoutMsg = new this.lib.SignedMessage(
            await this.blockchain.sendMessage(message, CashierConfig.postTo)
        );
        if(cashoutMsg.reply !== message.id ||
            cashoutMsg.from !== CashierConfig.pubkey ||
            !cashoutMsg.verify()
        ) throw new Error('Invalid Response');
        
        let {cashoutLoc, rawtx} = cashoutMsg.payloadObj;
        const t = await this.wallet.loadTransaction(rawtx);
        rawtx = await t.export({sign: true, pay: false});
        const txid = await this.blockchain.broadcast(rawtx);

        const paymentMsg = this.wallet.buildMessage({
            subject: 'CashoutPayment',
            payload: JSON.stringify({
                cashoutLoc,
                txid,
                deviceGPS
            })
        });
        await this.blockchain.sendMessage(paymentMsg, CashierConfig.postTo);
            
    }
}

Agent.deps = {
    Group
};

Agent.asyncDeps = {
    CashierConfig: 'config/{env}/cashier-config.js',
    EventEmitter: 'lib/event-emitter.js',
    KronoCoin: 'models/krono-coin.js',
    KronoError: 'lib/krono-error.js',
    Sha256: 'lib/sha256.js'
};

Agent.sealed = false;

module.exports = Agent;
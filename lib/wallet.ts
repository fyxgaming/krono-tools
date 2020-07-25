import { Ecdsa, Hash, KeyPair, PubKey, Random, Sig } from 'bsv2';
import { EventEmitter } from 'events';
import { RestBlockchain } from './rest-blockchain';
import { IJig } from './interfaces';
import { SignedMessage } from './signed-message';
import { RunTransaction } from './run-transaction';

export class Wallet extends EventEmitter {
    private blockchain: RestBlockchain;
    address: string;
    purse: string;
    private transaction: any;
    balance: () => Promise<number>

    constructor(
        private paymail: string,
        private keyPair: KeyPair,
        private run: any
    ) {
        super();
        this.blockchain = run.blockchain;
        this.purse = run.purse.address;
        this.address = run.owner.address;
        this.balance = run.purse.balance;
        this.transaction = new RunTransaction(run);
        console.log(`ADDRESS: ${this.address}`);
        console.log(`PURSE: ${this.purse}`);

        // const protect: (string | number | symbol)[] = ['run', 'keyPair', 'finalizeTx', 'transaction'];
        // return new Proxy(this, {
        //     get: (target, prop, receiver) => {
        //         if (protect.includes(prop)) return undefined;
        //         return Reflect.get(target, prop, receiver);
        //     },
        //     // TODO evaluate other traps
        //     getOwnPropertyDescriptor: (target, prop) => {
        //         if (protect.includes(prop)) return undefined;
        //         return Reflect.getOwnPropertyDescriptor(target, prop);
        //     }
        // });
    }

    get now() {
        return Date.now();
    }

    async loadJigIndex() {
        return this.blockchain.jigIndex(this.address);
    }

    async loadJig(loc: string): Promise<IJig> {
        console.time(`load ${loc}`);
        const jig = await this.run.load(loc).catch((e) => {
            if (e.message.includes('not a run tx') ||
                e.message.includes('not a jig output') ||
                e.message.includes('Not a token')
            ) {
                console.log('Not a jig:', loc);
                return;
            }
            console.error('Load error:', loc, e.message);
        });
        console.timeEnd(`load ${loc}`);
        return jig;
    }

    async loadJigs() {
        console.log('Load Jigs', this.address);
        const utxos = await this.blockchain.utxos(this.address);
        console.log('UTXOS:', utxos.length);
        const jigs: IJig[] = [];
        for (const utxo of utxos) {
            const loc = `${utxo.txid}_o${utxo.vout}`;
            const jig = await this.loadJig(loc);
            if (jig) jigs.push(jig);
        }
        console.log('JIGS:', jigs.length);
        return jigs;
    }


    buildMessage(messageData: Partial<SignedMessage>, sign = true): SignedMessage {
        messageData.ts = Date.now();
        messageData.from = this.paymail;
        const message = new SignedMessage(messageData);
        if (sign) message.sign(this.keyPair);
        return message;
    }

    async encrypt(pubkey: string) {

    }

    async decrypt(value) {

    }

    async verifySig(sig, hash, pubkey): Promise<boolean> {
        const msgHash = await Hash.asyncSha256(Buffer.from(hash));
        const verified = Ecdsa.verify(msgHash, Sig.fromString(sig), PubKey.fromString(pubkey));
        console.log('SIG:', verified, sig, hash, pubkey);
        return verified;
    }

    async runTransaction(work: (t) => Promise<any>) {
        try {
            this.transaction.begin();
            return await work(this.transaction);
        } finally {
            this.transaction.rollback();
        }
    }

    async loadTransaction(rawtx: string, work: (t) => Promise<any>) {
        try {
            await this.transaction.import(rawtx);
            return await work(this.transaction);
        } finally {
            this.transaction.rollback();
        }
    }

    randomInt(max) {
        return Math.floor(Math.random() * (max || Number.MAX_SAFE_INTEGER));
    }

    randomBytes(size: number): string {
        return Random.getRandomBuffer(size).toString('hex');
    }

    // async cashout(address) {
    //     const utxos = await this.blockchain.utxos(this.run.purse.address);
    //     const tx = new Transaction()
    //         .from(utxos)
    //         .change(address)
    //         .sign(this.run.purse.privkey);
    //     await this.blockchain.broadcast(tx);
    //     // this.clientEmit('BalanceUpdated', await this.balance);
    // }
}

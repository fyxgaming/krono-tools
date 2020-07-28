import { Address, Ecdsa, Hash, KeyPair, PrivKey, PubKey, Random, Sig, Tx } from 'bsv';
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
    load: (loc: string) => Promise<IJig>;
    ownerPair: KeyPair;
    pursePair: KeyPair;

    constructor(
        public paymail: string,
        private keyPair: KeyPair,
        run: any
    ) {
        super();
        this.blockchain = run.blockchain;
        this.ownerPair = KeyPair.fromPrivKey(PrivKey.fromString(run.owner.privkey));
        this.pursePair = KeyPair.fromPrivKey(PrivKey.fromString(run.purse.privkey));
        this.purse = run.purse.address;
        this.address = run.owner.address;
        this.balance = run.purse.balance.bind(run.purse);
        this.load = run.load.bind(run);
        this.transaction = new RunTransaction(run);
        console.log(`PAYMAIL: ${paymail}`);
        console.log(`PUBKEY: ${keyPair.pubKey.toString()}`);
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

    async loadJig(loc: string): Promise<IJig | void> {
        console.time(`load ${loc}`);
        const jig = await this.load(loc).catch((e) => {
            if (e.message.match(/not a/i)) return;
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
        messageData.from = this.keyPair.pubKey.toString();
        const message = new SignedMessage(messageData);
        if (sign) message.sign(this.keyPair);
        return message;
    }

    async signTx(tx: Tx): Promise<Tx> {
        await Promise.all(tx.txIns.map(async (txIn, i) => {
            const txid = txIn.txHashBuf.reverse().toString('hex')
            const outTx = Tx.fromHex(await this.blockchain.fetch(txid, false, true));
            const txOut = outTx.txOuts[txIn.txOutNum];
            const address = Address.fromTxOutScript(txOut.script).toString();
            if(address === this.purse) {
                return tx.asyncSign (this.pursePair, undefined, i, txOut.script, txOut.valueBn)
            } else if(address === this.address) {
                return tx.asyncSign (this.ownerPair, undefined, i, txOut.script, txOut.valueBn)
            }
        }));
        return tx;
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

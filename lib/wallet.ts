import { Address, Ecdsa, Hash, KeyPair, PrivKey, PubKey, Random, Script, Sig, Tx, TxOut } from 'bsv';
import { EventEmitter } from 'events';
import { RestBlockchain } from './rest-blockchain';
import { IJig } from './interfaces';
import { SignedMessage } from './signed-message';
import { Transaction } from '@kronoverse/run';

export class Wallet extends EventEmitter {
    private blockchain: RestBlockchain;
    address: string;
    purse: string;
    pubkey: string;
    balance: () => Promise<number>
    load: (loc: string) => Promise<IJig>;
    createTransaction: () => Transaction;
    loadTransaction: (rawtx: string) => Promise<Transaction>;

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
        this.pubkey = keyPair.pubKey.toHex();
        this.purse = run.purse.address;
        this.address = run.owner.address;
        this.balance = run.purse.balance.bind(run.purse);
        this.load = run.load.bind(run);
        this.createTransaction = () => new Transaction();
        this.loadTransaction = (rawtx: string) => run.import(rawtx);
        
        console.log(`PAYMAIL: ${paymail}`);
        console.log(`PUBKEY: ${keyPair.pubKey.toString()}`);
        console.log(`ADDRESS: ${this.address}`);
        console.log(`PURSE: ${this.purse}`);
    }

    get now() {
        return Date.now();
    }

    async loadJigIndex() {
        return this.blockchain.jigIndex(this.address);
    }

    async loadJig(loc: string): Promise<IJig | void> {
        const jig = await this.load(loc).catch((e) => {
            if (e.message.match(/not a/i)) return;
            console.error('Load error:', loc, e.message);
            throw e;
        });
        return jig;
    }

    async loadJigs() {
        const jigIndex = await this.loadJigIndex();
        const jigs = await Promise.all(jigIndex.map(j => this.loadJig(j.location)))
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

    async signTx(tx: Tx): Promise<TxOut[]> {
        return Promise.all(tx.txIns.map(async (txIn, i) => {
            const txid = Buffer.from(txIn.txHashBuf).reverse().toString('hex');
            const outTx = Tx.fromHex(await this.blockchain.fetch(txid));
            const txOut = outTx.txOuts[txIn.txOutNum];
            if (txOut.script.isPubKeyHashOut()) {
                const address = Address.fromTxOutScript(txOut.script).toString();
                if (address === this.purse) {
                    const sig = await tx.asyncSign(this.pursePair, undefined, i, txOut.script, txOut.valueBn);
                    txIn.setScript(new Script().writeBuffer(sig.toTxFormat()).writeBuffer(this.pursePair.pubKey.toBuffer()));
                } else if (address === this.address) {
                    const sig = await tx.asyncSign(this.ownerPair, undefined, i, txOut.script, txOut.valueBn);
                    txIn.setScript(new Script().writeBuffer(sig.toTxFormat()).writeBuffer(this.ownerPair.pubKey.toBuffer()));
                }
            }
            return txOut;
        }));
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

    randomInt(max) {
        return Math.floor(Math.random() * (max || Number.MAX_SAFE_INTEGER));
    }

    randomBytes(size: number): string {
        return Random.getRandomBuffer(size).toString('hex');
    }

    setTimeout(cb: () => Promise<void>, ms: number):  NodeJS.Timeout {
        return setTimeout(async () => {
            try {
                await cb();
            } catch(e) {
                console.error('Timeout Error', e);
            }
        }, ms);
    }

    clearTimeout(timeoutId: NodeJS.Timeout): void {
        return timeoutId && clearTimeout(timeoutId);
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

import { Blockchain } from '.';
import { IUTXO } from '../interfaces';
import createError from 'http-errors';

const { Script, Transaction } = require('bsv');
export class MockBlockchain extends Blockchain {
    protected apiUrl: string;
    protected cache = new Map<string, any>();

    txns = new Map<string, any>();
    unspent = new Map<string, IUTXO>();
    locks = new Map<string, number>();
    channels = new Map<string, any>();

    async broadcast(tx) {
        if (tx.getLockTime() > Date.now()) {
            await this.validateTx(tx);
            await this.updateChannel(tx);
        }
        else {
            await this.validateTx(tx);
            const utxos = await this.saveTx(tx, true);
            this.emit('tx', tx.hash);
            utxos.forEach(utxo => this.emit('utxo', utxo));
            const spent = tx.inputs.map((i) => `${i.prevTxId.toString('hex')}_o${i.outputIndex}`);
            spent.forEach(loc => this.emit('spent', loc));
            return utxos;
        }
    }

    async validateTx(tx) {
        if (tx.inputs.length === 0) throw new Error('tx has no inputs');
        if (tx.outputs.length === 0) throw new Error('tx has no outputs');
        const verify = tx.verify();
        if (verify !== true) throw new Error(verify as string);
        if (tx.isFullySigned() !== true) throw new Error('tx not fully signed');

        const locs = tx.inputs.map((i) => `${i.prevTxId.toString('hex')}_o${i.outputIndex}`);
        // Find each input UTXO
        const utxos = await this.utxosByLoc(locs);

        const utxosByLoc: Map<string, any> = utxos.reduce((acc, utxo) => {
            acc.set(utxo._id, utxo);
            return acc;
        }, new Map<string, any>());

        // Verify each input
        locs.forEach((loc, i) => {
            const utxo = utxosByLoc.get(loc);
            if (!utxo) throw new Error(`tx input ${i} missing or spent: ${loc}`);
            // if (!this.validateInput(tx, i, utxo)) throw new Error('Script Invalid');
        });
    }

    validateInput(tx, i) {
        const Interpreter = Script.Interpreter;
        const flags = Interpreter.SCRIPT_VERIFY_STRICTENC |
            Interpreter.SCRIPT_VERIFY_DERSIG |
            Interpreter.SCRIPT_VERIFY_LOW_S |
            Interpreter.SCRIPT_VERIFY_NULLDUMMY |
            Interpreter.SCRIPT_VERIFY_SIGPUSHONLY |
            Interpreter.SCRIPT_ENABLE_MONOLITH_OPCODES |
            Interpreter.SCRIPT_ENABLE_MAGNETIC_OPCODES |
            Interpreter.SCRIPT_ENABLE_SIGHASH_FORKID

        const interpreter = new Interpreter();
        const valid = interpreter.verify(
            tx.inputs[i].script, tx.inputs[i].output.script, tx, i,
            flags, tx.inputs[i].output.satoshisBN
        );
        return valid;
    }

    async saveTx(tx, saveUtxos?: boolean): Promise<IUTXO[]> {
        const ts = Date.now();
        const txid = tx.hash;
        this.txns.set(txid, {
            ...tx.toObject(),
            spent: tx.outputs.map(o => null)
        });
        this.emit('txn', tx);

        tx.inputs.map((vin, i) => {
            const spentTxId = vin.prevTxId.toString('hex');
            const spentTx = this.txns.get(spentTxId);
            const loc = `${spentTxId}_o${vin.outputIndex}`;
            this.unspent.delete(loc);
            this.locks.delete(loc);
            this.channels.delete(loc);
            if (!spentTx) return;
            spentTx.spent[vin.outputIndex] = { txid, i };
        });

        const utxos = tx.outputs.map((o, vout) => o.script.isPublicKeyHashOut() && {
            _id: `${txid}_o${vout}`,
            address: o.script.toAddress(this.bsvNetwork).toString(),
            script: o.script.toString(),
            satoshis: o.satoshis,
            txid,
            ts,
            vout
        }).filter(utxo => utxo);

        utxos.forEach(utxo => {
            this.unspent.set(utxo._id, utxo)
            this.emit(utxo.address, utxo);
            this.emit('utxo', utxo);
        });

        return utxos;
    }

    async fetch(txid: string, force = false, asObject = false) {
        const txData = this.txns.get(txid);
        if (!txData) throw createError(404, 'Tx missing');
        if (asObject) return txData;
        const tx = new Transaction(txData);
        tx.outputs.forEach((o: any, i) => {
            o.spentTxId = txData.spent[i]?.txid || null
            o.spentIndex = txData.spent[i]?.i || null
        });
        return tx;
    };

    async utxos(address, start = 0) {
        if (typeof address !== 'string') {
            address = address.toAddress(this.bsvNetwork).toString();
        }
        const utxos = [];
        for (const utxo of this.unspent.values()) {
            if (utxo.address === address && utxo.ts > start) utxos.push(utxo);
        }
        return utxos;
    }

    async isSpent(loc: string) {
        return !this.unspent.has(loc);
    }

    async utxosByLoc(locs: string[]) {
        return locs.map(loc => this.unspent.get(loc))
            .filter(utxo => utxo);
    }

    async lockUtxo(address: string, lockUntil: number, satoshis: number) {
        const now = Date.now();
        for (const utxo of this.unspent.values()) {
            if (utxo.address !== address) continue;
            if (utxo.satoshis < satoshis) continue;
            const lock = this.locks.get(utxo._id) || 0;
            if (lock < now) {
                this.locks.set(utxo._id, lockUntil);
                return utxo;
            }
        }
        return;
    }

    fund(address, satoshis) {
        const tx = new Transaction()
            .addData(Math.random().toString())
            .to(address, satoshis);

        this.txns.set(tx.hash, {
            ...tx.toObject(),
            spent: tx.outputs.map(o => null)
        });

        const out = tx.outputs[1];
        const loc = `${tx.hash}_o1`

        this.unspent.set(loc, {
            _id: `${tx.hash}_o1`,
            address: out.script.toAddress(process.env.BSVNETWORK).toString(),
            script: out.script.toString(),
            satoshis: out.satoshis,
            txid: tx.hash,
            ts: Date.now(),
            vout: 1
        });
    }

    async change(change, purse: string) {
        const address = change.toAddress().toString();

        const utxos = await this.utxos(address);
        let totalFunds = utxos.reduce((acc, utxo) => acc + utxo.satoshis, 0);

        if (totalFunds < 5000000 && utxos.length < 50) return;

        const tx = new Transaction()
            .from(utxos);
        let outputs = 0;
        let funds = 0;
        while (totalFunds > 200000 && outputs++ < 1000) {
            tx.to(purse, 100000);
            totalFunds -= 100000;
            funds += 100000;
        }
        tx.change(address);
        tx.sign(change);
        await this.broadcast(tx);
    }

    async getChannel(loc: string): Promise<any> {
        return this.channels.get(loc);
    }

    async updateChannel(tx) {
        const ts = Date.now();
        const recipients = tx.outputs.map((o, i) => o.script.toAddress(this.bsvNetwork).toString());
        const inputs = tx.inputs.map((i) => ({
            loc: `${i.prevTxId.toString('hex')}_o${i.outputIndex}`,
            seq: i.sequenceNumber
        }));

        const channels = inputs.map((input, i) => {
            const utxo = this.unspent.get(input.loc);
            if (!utxo) throw new Error(`tx input ${i} missing or spent: ${input.loc}`);
            let channel = this.channels.get(input.loc);
            if (channel && channel.seq >= input.seq) return;
            if (!this.validateInput(tx, i)) return;
            channel = {
                ...tx.toObject(),
                ...input,
                recipients,
                ts
            };
            this.channels.set(input.loc, channel);
            return channel;
        });

        channels.forEach(channel => channel && this.emit('channel', channel));
    }
}

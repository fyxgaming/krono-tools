import { IUTXO } from '../interfaces';
import { EventEmitter } from 'events';

const { Script } = require('bsv');
export abstract class Blockchain extends EventEmitter {
    constructor(public network: string) {
        super();
    }

    get bsvNetwork(): string {
        switch (this.network) {
            case 'stn':
                return 'stn';
            case 'main':
                return 'mainnet';
            default:
                return 'testnet';
        }
    }

    async broadcast(tx): Promise<IUTXO[]> {
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

    abstract saveTx(tx, saveUtxos?: boolean): Promise<IUTXO[]>;

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
            if (!this.validateInput(tx, i)) throw new Error('Script Invalid');
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

    async populatePreviousOutputs(tx) {
        await Promise.all(tx.inputs.map(async input => {
            if (input.output) return;
            const prevTxId = input.prevTxId.toString('hex');
            const prevTx = await this.fetch(prevTxId);
            input.output = prevTx.outputs[input.outputIndex];
        }));
    }

    async fetch(txid: string, force?: boolean, asObject?: boolean): Promise<any> {
        throw new Error('fetch not implemented');
    };

    abstract utxos(address): Promise<IUTXO[]>;

    async balance(address) {
        const utxos = await this.utxos(address);
        return utxos.reduce((acc, utxo) => acc + utxo.satoshis, 0);
    }

    abstract isSpent(loc): Promise<boolean>;

    abstract utxosByLoc(locs: string[]): Promise<IUTXO[]>;

    abstract lockUtxo(address: string, expires: number, satoshis: number): Promise<IUTXO>;

    async getChannel(loc: string): Promise<any> {
        throw new Error('getChannel not implemented');
    }

    async updateChannel(tx) {
        throw new Error('updateChannel not implemented');
    };
}

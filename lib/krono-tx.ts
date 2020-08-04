import { Address, Bn, OpCode, Script, Tx } from 'bsv';
import { IUTXO } from './interfaces';

export class KronoTx extends Tx {
    fromUtxo(utxo: IUTXO): void {
        return super.addTxIn(
            Buffer.from(utxo.txid, 'hex').reverse(),
            utxo.vout,
            new Script([OpCode.OP_0, OpCode.OP_0]),
            0    
        )
    }

    toAddress(satoshis: number, address: string): void {
        return super.addTxOut(
            new Bn(satoshis),
            Address.fromString(address).toTxOutScript()
        );
    }

    addSig(vin: number, script: string) {
        super.txIns[vin].setScript(Script.fromString(script));
    }
}
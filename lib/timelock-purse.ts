import bsv from 'bsv';
import { LocalPurse } from '@runonbitcoin/release';

export class TimelockPurse extends LocalPurse {
    private nLocktime = 0;
    private seqs = {};
    constructor(options: any) {
        super(options);
    }

    pay(rawtx: string) {
        const tx = new bsv.Transaction(rawtx);
        tx.inputs.forEach(i => {
            const loc = `${i.prevTxId.toString('hex')}_o${i.outputIndex}`;
            if (this.seqs[loc]) {
                (i as any).sequenceNumber = this.seqs[loc];
            }
        });

        if (this.nLocktime) {
            tx.lockUntilDate(this.nLocktime);
            return tx.toString();
        }
        return super.pay(tx.toString());
    }
}
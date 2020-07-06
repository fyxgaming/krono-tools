const { Transaction } = require('bsv');
const Run = require('../run/dist/run.node.min');

export class TimelockPurse extends Run.LocalPurse {
    private nLocktime = 0;
    private seqs = {};
    constructor(options: any) {
        super(options);
    }

    pay(rawtx: string) {
        const tx = new Transaction(rawtx);
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
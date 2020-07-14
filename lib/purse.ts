import { LocalPurse } from '@runonbitcoin/release';
import { PaymentRequired } from 'http-errors';
import { Blockchain } from './blockchain';

export class Purse extends LocalPurse {
    constructor(privkey, blockchain: Blockchain) {
        super(privkey, blockchain);
    }

    async pay(rawtx: string) {
        try {
            return super.pay(rawtx);
        } catch(e) {
            if (e.message.includes('Not enough funds')) {
                throw new PaymentRequired();
            }
            throw e;
        }
    }
}
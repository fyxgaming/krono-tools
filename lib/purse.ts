import { LocalPurse } from '@runonbitcoin/release';
import { PaymentRequired } from 'http-errors';

export class Purse extends LocalPurse {
    constructor(options) {
        super(options);
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
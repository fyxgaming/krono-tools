import { LocalPurse } from '@runonbitcoin/release';
import { PaymentRequired } from 'http-errors';

export class Purse extends LocalPurse {
    async pay(rawtx: string) {
        try {
            return super.pay();
        } catch(e) {
            if (e.message.includes('Not enough funds')) {
                throw new PaymentRequired();
            }
            throw e;
        }
    }
}
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

    abstract fetch(txid: string): Promise<any>;

    abstract utxos(address): Promise<any[]>;

    async getChannel(loc: string): Promise<any> {
        throw new Error('getChannel not implemented');
    }

    async updateChannel(tx) {
        throw new Error('updateChannel not implemented');
    };
}

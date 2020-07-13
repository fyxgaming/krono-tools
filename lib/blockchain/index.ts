import { EventEmitter } from 'events';

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

    abstract broadcast(tx): Promise<any>;

    abstract fetch(txid: string): Promise<any>;

    abstract utxos(address): Promise<any[]>;
    abstract isSpent(loc): Promise<boolean>;

    async getChannel(loc: string): Promise<any> {
        throw new Error('getChannel not implemented');
    }

    async saveChannel(loc: string, rawtx: string) {
        throw new Error('saveChannel not implemented');
    }
}

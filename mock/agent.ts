#!/usr/bin/env node

import { RestBlockchain } from '../lib/blockchain/rest-blockchain';
import { TimelockPurse } from '../lib/timelock-purse';
import { Wallet } from '../lib/wallet';
import { LRUCache } from '../lib/lru-cache';
import { IStorage } from '../lib/interfaces';

const { HDPrivateKey } = require('bsv');
const Run = require('@runonbitcoin/release');

export class Agent {
    private wallet: Wallet;

    constructor(apiUrl, xpriv) {
        const hdKey = HDPrivateKey.fromString(xpriv);
        const purse = hdKey.deriveChild('m/1').privateKey;
        const owner = hdKey.deriveChild('m/2').privateKey;

        const blockchain = new RestBlockchain(apiUrl, 'mock');
        const run = new Run({
            network: 'mock',
            blockchain,
            owner: owner.toString(),
            purse: new TimelockPurse({ blockchain, privkey: purse.toString() }),
            state: new LRUCache(100000000)
        });
        run.owner.owner = () => run.owner.pubkey;

        class Storage implements IStorage<any> {
            private store = new Map<string, any>()
            async get(key) { return this.store.get(key) }
            async set(key, value) { this.store.set(key, value) }
            async delete(key) { this.store.delete(key) }
        }
        const wallet = this.wallet = new Wallet(run, apiUrl, new Storage());
        wallet.on('schedule', (delaySeconds, handlerName, payload) => {
            console.log('ON SCHEDULE');
            setTimeout(() => {
                wallet.handleEvent(handlerName, payload);
            }, delaySeconds * 1000)
        });
    }

    async initialize(loc: string) {
        await this.wallet.initializeAgent(loc);
    }

    onUtxo(loc: string) {
        return this.wallet.onUtxo(loc);
    }

    onChannel(loc: string) {
        return this.wallet.onChannel(loc);
    }

    handleEvent(name: string, payload?: any) {
        return this.wallet.handleEvent(name, payload);
    }
}
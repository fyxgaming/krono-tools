#!/usr/bin/env node

import fetch from 'node-fetch';
import minimist from 'minimist';
import { RestBlockchain } from '../lib/blockchain/rest-blockchain';
import { TimelockPurse } from '../lib/timelock-purse';
import { Wallet } from '../lib/wallet';
import EventSource from 'eventsource';
import { LRUCache } from '../lib/lru-cache';
import { IStorage } from '../lib/interfaces';
import { RestNotifier } from '../lib/notifier/rest-notifier';

const { HDPrivateKey } = require('bsv');
const Run = require('../run/dist/run.node.min');

export async function initializeAgent(apiUrl, agent, xpriv) {
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
    const resp = await fetch(`${apiUrl}/agents/${agent}`);
    if (!resp.ok) throw new Error(await resp.text());
    const agentDef = await resp.json();
    class Storage implements IStorage<any> {
        private store = new Map<string, any>()
        async get(key) { return this.store.get(key) }
        async set(key, value) { this.store.set(key, value) }
        async delete(key) { this.store.delete(key) }
    }
    const wallet = new Wallet(run, apiUrl, new Storage(), new RestNotifier(apiUrl));
    wallet.on('message', async message => {
        const resp = await fetch(`${apiUrl}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(message)
        });
        if (!resp.ok) throw new Error(await resp.text());
    });

    wallet.on('schedule', (delaySeconds, handlerName, payload) => {
        console.log('ON SCHEDULE');
        setTimeout(() => {
            wallet.handleEvent(handlerName, payload);
        }, delaySeconds * 1000)
    });

    await wallet.initializeAgent(agentDef.location);

    const events = new EventSource(`${apiUrl}/notify/${run.owner.address}`);
    events.addEventListener('utxo', async (event: any) => {
        const loc = event.data;
        try {
            await wallet.onUtxo(loc);
        } catch (e) {
            console.error('UTXO error', e.message, e.stack);
        }
    });
    events.addEventListener('act', async (event: any) => {
        try {
            console.log('ACT:', event.data);
            const action = JSON.parse(event.data);
            wallet.handleEvent(action.name, action);
        } catch (e) {
            console.error('ACT error', e.message, e.stack);
        }
    });
    events.addEventListener('channel', async (event: any) => {
        const loc = event.data;
        try {
            wallet.onChannel(loc);
        } catch (e) {
            console.error('CHANNEL error', e.message, e.stack);
        }
    });
};

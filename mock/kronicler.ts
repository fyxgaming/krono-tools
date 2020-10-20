import bsv from 'bsv';
import { Bip32, KeyPair } from 'bsv';
import { RestBlockchain } from '@kronoverse/lib/dist/rest-blockchain';
import { RestStateCache } from '@kronoverse/lib/dist/rest-state-cache';
import { Wallet } from '@kronoverse/lib/dist/wallet';
import Run from '@kronoverse/run';
import Redis from 'ioredis-mock';
import { SignedMessage } from '@kronoverse/lib/dist/signed-message';
import fetch from 'node-fetch';

import { expose } from 'threads/worker';

import {WSClient} from '@kronoverse/lib/dist/ws-client';
import WebSocket from 'ws';

let wallet;
let agent;
let id;
expose({
    init: async (agentId, apiUrl, xpriv, paymail, agentLoc, subscribe, initParams) => {
        id = agentId;
        const bip32 = Bip32.fromString(xpriv);
        const purse = bip32.derive('m/0/0').privKey.toString();
        const owner = bip32.derive('m/1/0').privKey.toString();
        const keyPair = KeyPair.fromPrivKey(bip32.derive('m/1/0').privKey);

        const localCache = new Run.LocalCache({ maxSizeMB: 100 });
        const cache = new RestStateCache(apiUrl, localCache, false);
        const blockchain = new RestBlockchain(apiUrl, 'mock', localCache, false);
        const run = new Run({
            network: 'mock',
            blockchain,
            owner,
            purse,
            cache,//: localCache,
            timeout: 360000,
            trust: '*',
            // logger: console
        });

        wallet = new Wallet(paymail, keyPair, run);
        await blockchain.fund(run.purse.address);

        const storage = new Redis();
        console.log('Agent Load', agentLoc);
        const Agent = await run.load(agentLoc);
        // await Agent.sync();
        const channels = [];
        if(subscribe) {
            channels.push(keyPair.pubKey.toString(), run.owner.address);
        }
        const ws = new WSClient(WebSocket, `${apiUrl.replace('http','ws')}/ws`, channels);
        agent = new Agent(wallet, blockchain, storage, bsv, { fetch, Buffer, SignedMessage });
        agent.on('subscribe', (channel, lastId) => {
            ws.subscribe(channel, lastId);
        });
        agent.on('unsubscribe', (channel) => {
            ws.unsubscribe(channel);
        });
        agent.on('enableLogs', () => {
            run.logger = console;
        });
        agent.on('disableLogs', () => {
            run.logger = undefined;
        });
        agent.on('close', async () => {
            console.log(id, 'shutting down');
            process.exit();
        });
        console.log('Init Params:', initParams);
        await agent.init(initParams);
        ws.on('msg', async (message) => {
            // const message = JSON.parse(e.data);
            console.log(`${id}-Message:`, message);
            await agent.onMessage(new SignedMessage(message)).catch(console.error);
        });

        ws.on('jig', async (jig) => {
            // const jigData = JSON.parse(e.data);
            console.log(`${id}-jig-${jig.kind}-${jig.location}`);
            await agent.onJig(jig).catch(console.error);
        });
    },
    message: async (message) => {
        console.log(`${id}-Message:`, message);
        const result = await agent.onMessage(new SignedMessage(message));
        return result || null;
    },
    event: async (handler, payload) => {
        return agent.onEvent(handler, payload);
    }
});
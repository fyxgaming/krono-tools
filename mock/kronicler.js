"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bsv_1 = __importDefault(require("bsv"));
const bsv_2 = require("bsv");
const rest_blockchain_1 = require("@kronoverse/lib/dist/rest-blockchain");
const rest_state_cache_1 = require("@kronoverse/lib/dist/rest-state-cache");
const wallet_1 = require("@kronoverse/lib/dist/wallet");
const run_1 = __importDefault(require("@kronoverse/run"));
const ioredis_mock_1 = __importDefault(require("ioredis-mock"));
const signed_message_1 = require("@kronoverse/lib/dist/signed-message");
const node_fetch_1 = __importDefault(require("node-fetch"));
const worker_1 = require("threads/worker");
const ws_client_1 = require("@kronoverse/lib/dist/ws-client");
const ws_1 = __importDefault(require("ws"));
let wallet;
let agent;
let id;
worker_1.expose({
    init: async (agentId, apiUrl, xpriv, paymail, agentLoc, subscribe, initParams) => {
        id = agentId;
        const bip32 = bsv_2.Bip32.fromString(xpriv);
        const purse = bip32.derive('m/0/0').privKey.toString();
        const owner = bip32.derive('m/1/0').privKey.toString();
        const keyPair = bsv_2.KeyPair.fromPrivKey(bip32.derive('m/1/0').privKey);
        const localCache = new run_1.default.LocalCache({ maxSizeMB: 100 });
        const cache = new rest_state_cache_1.RestStateCache(apiUrl, localCache, false);
        const blockchain = new rest_blockchain_1.RestBlockchain(apiUrl, 'mock', localCache, false);
        const run = new run_1.default({
            network: 'mock',
            blockchain,
            owner,
            purse,
            cache,
            timeout: 360000,
            trust: '*',
        });
        wallet = new wallet_1.Wallet(paymail, keyPair, run);
        await blockchain.fund(run.purse.address);
        const storage = new ioredis_mock_1.default();
        console.log('Agent Load', agentLoc);
        const Agent = await run.load(agentLoc);
        // await Agent.sync();
        const channels = [];
        if (subscribe) {
            channels.push(keyPair.pubKey.toString(), run.owner.address);
        }
        const ws = new ws_client_1.WSClient(ws_1.default, `${apiUrl.replace('http', 'ws')}/ws`, channels);
        agent = new Agent(wallet, blockchain, storage, bsv_1.default, { fetch: node_fetch_1.default, Buffer, SignedMessage: signed_message_1.SignedMessage });
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
            await agent.onMessage(new signed_message_1.SignedMessage(message)).catch(console.error);
        });
        ws.on('jig', async (jig) => {
            // const jigData = JSON.parse(e.data);
            console.log(`${id}-jig-${jig.kind}-${jig.location}`);
            await agent.onJig(jig).catch(console.error);
        });
    },
    message: async (message) => {
        console.log(`${id}-Message:`, message);
        const result = await agent.onMessage(new signed_message_1.SignedMessage(message));
        return result || null;
    },
    event: async (handler, payload) => {
        return agent.onEvent(handler, payload);
    }
});
//# sourceMappingURL=kronicler.js.map
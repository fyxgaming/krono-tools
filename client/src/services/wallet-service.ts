import { Bip32, Constants, KeyPair, PrivKey } from 'bsv';
//import { config } from 'node-config-ts';
const config = {
    network: 'testnet',
    apiUrl: '',
    sockets: '',
    ephemeral: true,
    emitLogs: false,
    app: '',
    errorLog: 'true'
};
import * as querystring from 'querystring';

import type { IMessage } from '../imessage';
import { Wallet } from '../../../lib/wallet';
import { RestBlockchain } from '../../../lib/rest-blockchain';
import { RestStateCache } from '../../../lib/storage/rest-state-cache';
import type { IAgent } from '../../../lib/interfaces';
import { IORedisMock } from '../../../lib/ioredis-mock';
import { SignedMessage } from '../../../lib/signed-message';
import { KronoAuth } from '../../../lib/auth';
import { EventEmitter } from 'events';
// import { Buffer } from 'buffer';

import { WSClient } from '../../../lib/ws-client';
import Run from '@kronoverse/run';

let queryParams: any = {};
const urlParts = window.location.href.split('?');
if (urlParts[1]) {
    const [query] = urlParts[1].split('#');
    queryParams = querystring.decode(query);
}

Constants.Default = config.network === 'main' ? Constants.Mainnet : Constants.Testnet;
import bsv from 'bsv';
bsv.Constants.Default = Constants.Default;
console.log('LOAD');

export class WalletService extends EventEmitter {
    private printLog = console.log.bind(console);
    private printError = console.error.bind(console);
    // private requestService: RequestService;

    private logId = 0;
    private logs: any[] = [];
    private sessionId = `${Date.now()}-${Math.random() * Number.MAX_SAFE_INTEGER}`;
    private agentDef?;
    private timeLabels = {};

    public wallet?: Wallet;
    private agent?: IAgent;

    private apiUrl = queryParams.apiUrl || config.apiUrl;
    private domain = document.location.hash.slice(1).split('@')[1];

    private auth: KronoAuth;

    constructor() {
        super();
        this.overrideConsole();
        this.auth = new KronoAuth(this.apiUrl, this.domain, config.network);
    }

    get channel() {
        const v = (window as any).vuplex;
        return (v) ? v : (window as any);
    }

    get channelScope(): string | null {
        const ref = (document as any).referrer;
        if (ref && !this.isInUnity) {
            return ref.match(/^.+:\/\/[^\/]+/)[0];
        } else {
            return null;
        }
    }

    get isInUnity(): boolean {
        return ((window as any).vuplex) ? true : false;
    }

    get handle(): string {
        return window.localStorage.getItem('HANDLE') || '';
    }

    set handle(value: string) {
        window.localStorage.setItem('HANDLE', value);
    }

    get keyPair() {
        const wif = window.localStorage.getItem('WIF');
        if (!wif) return null;
        return KeyPair.fromPrivKey(PrivKey.fromString(wif));
    }

    set keyPair(keyPair: KeyPair) {
        window.localStorage.setItem('WIF', keyPair.privKey.toString());
    }

    get agentId(): string {
        return document.location.hash.slice(1).split('@')[0];
    }

    get paymail(): string {
        return `${this.handle}@${this.domain}`;
    }

    async init(): Promise<any> {
        console.log('INIT');
        let initialized = false;
        while (config.ephemeral && !initialized) {
            await new Promise((resolve) => setTimeout(() => resolve(), 5000));
            const resp = await fetch(`${this.apiUrl}/initialize`);
            initialized = resp.ok && await resp.json();
        }
        this.clientEmit('WALLET_READY');
        this.channel.addEventListener('message', this.onClientEvent.bind(this));

        console.log('BLOCKCHAIN:', this.apiUrl);
        const url = `${this.apiUrl}/agents/${this.domain}/${this.agentId}`;
        console.log('fetching:', url);
        const resp = await fetch(url);
        if (!resp.ok) throw new Error(`${resp.status} - ${resp.statusText}`);
        this.agentDef = await resp.json();
        if (!this.agentDef) throw new Error('AGENT MISSING');

        if (config.errorLog) {
            setInterval(async () => {
                const logs = this.logs;
                this.logs = [];
                if (!logs.length) return;
                const resp = await fetch(config.errorLog, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(logs)
                });
                if (!resp.ok) throw new Error(`${resp.status} - ${resp.statusText}`);
            }, 5000);
        }

        // this.emit('show', 'login');
        // console.log('SHOW LOGIN');
        if (this.agentDef.anonymous) return this.initializeWallet();
        if (!config.ephemeral && !this.keyPair) return this.clientEmit('NO_KEYS');
        try {
            await this.initializeUser();
        } catch (e) {
            console.error('Login Error:', e.message);
            this.clientEmit('NO_KEYS');
        }
    }

    private async initializeWallet(owner?: string, purse?: string) {
        const cache = new Run.LocalCache({ maxSizeMB: 100 });
        const blockchain = new RestBlockchain(
            this.apiUrl,
            config.network,
            cache
        )
        const run = new Run({
            network: config.network,
            owner,
            blockchain,
            purse,
            cache: new RestStateCache(this.apiUrl, cache),
            app: config.app || 'kronoverse',
            trust: '*',
            timeout: 60000,
            logger: {
                error: console.error
            }
        });

        const wallet = this.wallet = new Wallet(
            this.paymail,
            this.keyPair,
            run
        );

        const storage = new IORedisMock();

        const channels = [this.keyPair.pubKey.toString()];
        let ws;
        if (config.sockets) {
            console.log('Sockets:', config.sockets);
            ws = new WSClient(WebSocket, config.sockets, channels);
        }

        console.log('DOMAIN:', this.domain);
        console.log('AGENT_ID:', this.agentId);
        console.log('LOC:', this.agentDef.location);
        const Agent = await run.load(this.agentDef.location);
        const agent = this.agent = new Agent(wallet, blockchain, storage, bsv, { fetch, Buffer, ws, SignedMessage });
        agent.on('client', this.clientEmit.bind(this));
        agent.on('subscribe', (channel: string, lastId?: number) => {
            ws.subscribe(channel, lastId);
        });
        agent.on('unsubscribe', (channel: string) => {
            ws.unsubscribe(channel);
        });
        await agent.init();
        this.clientEmit('AGENT_LOADED');


        ws.on('jig', (jig, channel) => {
            console.log('JIG:', JSON.stringify(jig));
            agent.onJig(jig).catch(console.error);
        });
        ws.on('msg', (message, channel) => {
            console.log('MSG:', JSON.stringify(message));
            agent.onMessage(new SignedMessage(message)).catch(console.error);
        });
    }

    async initializeUser(handle?) {
        console.log('Initializing User');
        if (handle) this.handle = handle;
        let bip32;
        if (config.ephemeral) {
            bip32 = Bip32.fromRandom();
            this.keyPair = KeyPair.fromPrivKey(bip32.privKey);
        } else {
            console.log('Recovering account');
            const xpriv = await this.auth.recover(this.paymail, this.keyPair)
            bip32 = Bip32.fromString(xpriv);
        }
        this.initializeWallet(
            bip32.derive('m/1/0').privKey.toString(),
            bip32.derive('m/0/0').privKey.toString()
        );
    }

    async login(handle: string, password: string) {
        this.keyPair = await this.auth.login(handle, password);
        await this.initializeUser(handle);
    }

    async register(handle: string, password: string, email: string) {
        this.keyPair = await this.auth.register(handle, password, email);
        await this.initializeUser(handle);
    }

    async logout() {
        window.localStorage.removeItem('WIF');
        window.localStorage.removeItem('HANDLE');
    }

    private async onClientEvent(event: any) {
        const message: any = {};
        if (!this.tryParseMessageData(event.data, message)) return;

        if (['Register', 'Login'].includes(message.name)) {
            console.log(`WALLET RECEIVED EVENT:`, message.name);
        } else {
            console.log(`WALLET RECEIVED EVENT:`, JSON.stringify(message));
        }

        const response: any = {
            name: `On${message.name}`
        };
        try {
            const payload = message.payload && JSON.parse(message.payload);
            switch (message.name) {
                case 'Register':
                    await this.register(payload.handle, payload.password, payload.email);
                    break;
                case 'Login':
                    await this.login(payload.handle, payload.password);
                    break;
                case 'Logout':
                    await this.logout();
                    break;
                case 'Cashout':
                    if (!this.wallet) throw new Error('Wallet not initialized');
                    // await this.wallet.cashout(payload);
                    this.clientEmit('BalanceUpdated', 0);
                    break;
                case 'IsHandleAvailable':
                    response.payload = JSON.stringify(await this.auth.isHandleAvailable(payload));
                    break;
                default:
                    if (!this.agent) throw new Error('Agent not initialized');
                    const result = await this.agent.onEvent(message.name, payload);
                    response.payload = result && JSON.stringify(result);
            }
            response.success = true;
        } catch (e) {
            response.success = false;
            response.payload = JSON.stringify(e.message);
            if (e.message.includes('Not enough funds')) {
                response.statusCode = 402;
            } else {
                response.statusCode = e.status || 500;
            }
        }
        console.log(response.name, response.payload);
        this.postMessage(response);
        return;
    }

    private tryParseMessageData(data: any, outByRef: any): boolean {
        const message: any = (outByRef || {});
        if (typeof data === 'string') {
            Object.assign(message, JSON.parse(Buffer.from(data, 'base64').toString()));
        } else if (typeof data === 'object') {
            Object.assign(message, data);
        }
        return message && message.name;
    }

    private clientEmit(name: any, payload?: any): void {
        // console.log('Emitting', name, payload && JSON.stringify(payload));
        const message = {
            name,
            payload: payload && JSON.stringify(payload),
            success: true
        };
        this.logs.push({
            idx: this.logId++,
            sessionId: this.sessionId,
            handle: this.handle,
            type: 'log',
            ts: Date.now(),
            message: {
                name,
                payload
            }
        });
        this.postMessage(message);
    }

    private postMessage(message: IMessage) {
        message.target = 'kronoverse';
        if (this.isInUnity) {
            this.channel.postMessage(message);
        } else if (this.channelScope) {
            this.channel.parent.postMessage(message, this.channelScope);
        }
    }

    private overrideConsole() {
        console.log = (...messages) => {
            messages.unshift(Date.now());
            const message = messages.join(' ');
            this.logs.push({
                idx: this.logId++,
                sessionId: this.sessionId,
                paymail: this.paymail,
                type: 'log',
                ts: Date.now(),
                message
            });
            if (config.emitLogs) this.clientEmit('Log', message);
            this.printLog(...messages);
        };

        console.error = (...messages) => {
            messages.unshift(Date.now());
            const message = messages.join(' ');
            this.logs.push({
                idx: this.logId++,
                sessionId: this.sessionId,
                paymail: this.paymail,
                type: 'error',
                ts: Date.now(),
                message
            });
            if (config.emitLogs) this.clientEmit('Error', message);
            this.printError(...messages);
        };
        console.time = (label) => {
            this.timeLabels[label] = Date.now();
        };
        console.timeEnd = (label) => {
            console.log(`${label}: ${Date.now() - this.timeLabels[label] || 0}ms`);
        };
    }
}

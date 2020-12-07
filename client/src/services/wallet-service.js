"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.WalletService = void 0;
var bsv_1 = require("bsv");
var wallet_1 = require("@kronoverse/lib/dist/wallet");
var rest_blockchain_1 = require("@kronoverse/lib/dist/rest-blockchain");
var rest_state_cache_1 = require("@kronoverse/lib/dist/rest-state-cache");
var signed_message_1 = require("@kronoverse/lib/dist/signed-message");
var auth_service_1 = require("./auth-service");
var events_1 = require("events");
var ws_client_1 = require("@kronoverse/lib/dist/ws-client");
var run_1 = require("@kronoverse/run");
var buffer_1 = require("buffer");
var bsv_2 = require("bsv");
bsv_2["default"].Constants.Default = bsv_1.Constants.Default;
var WalletService = /** @class */ (function (_super) {
    __extends(WalletService, _super);
    function WalletService() {
        var _this = _super.call(this) || this;
        _this.authenticated = false;
        _this.printLog = console.log.bind(console);
        _this.printError = console.error.bind(console);
        _this.logId = 0;
        _this.logs = [];
        _this.sessionId = Date.now() + "-" + Math.random() * Number.MAX_SAFE_INTEGER;
        _this.timeLabels = {};
        _this.apiUrl = '';
        _this.domain = document.location.hash.slice(1).split('@')[1];
        return _this;
    }
    Object.defineProperty(WalletService.prototype, "channel", {
        get: function () {
            var v = window.vuplex;
            return (v) ? v : window;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WalletService.prototype, "channelScope", {
        get: function () {
            var ref = document.referrer;
            if (ref && !this.isInUnity) {
                return ref.match(/^.+:\/\/[^\/]+/)[0];
            }
            else {
                return null;
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WalletService.prototype, "isInUnity", {
        get: function () {
            return (window.vuplex) ? true : false;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WalletService.prototype, "handle", {
        get: function () {
            return window.localStorage.getItem('HANDLE') || '';
        },
        set: function (value) {
            window.localStorage.setItem('HANDLE', value);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WalletService.prototype, "keyPair", {
        get: function () {
            var wif = window.localStorage.getItem('WIF');
            if (!wif)
                return null;
            return bsv_1.KeyPair.fromPrivKey(bsv_1.PrivKey.fromString(wif));
        },
        set: function (keyPair) {
            window.localStorage.setItem('WIF', keyPair.privKey.toString());
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WalletService.prototype, "agentId", {
        get: function () {
            return document.location.hash.slice(1).split('@')[0];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WalletService.prototype, "paymail", {
        get: function () {
            return this.handle + "@" + this.domain;
        },
        enumerable: false,
        configurable: true
    });
    WalletService.prototype.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            var resp, config, _a, initialized, _b, url, _c, e_1;
            var _this = this;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, fetch(this.apiUrl + "/wallet/config")];
                    case 1:
                        resp = _d.sent();
                        _a = this;
                        return [4 /*yield*/, resp.json()];
                    case 2:
                        config = _a.config = _d.sent();
                        console.log('Config:', JSON.stringify(config));
                        this.overrideConsole();
                        bsv_1.Constants.Default = config.network === 'main' ? bsv_1.Constants.Mainnet : bsv_1.Constants.Testnet;
                        this.auth = new auth_service_1.AuthService(this.apiUrl, this.domain, config.network);
                        initialized = false;
                        _d.label = 3;
                    case 3:
                        if (!(config.ephemeral && !initialized)) return [3 /*break*/, 8];
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(function () { return resolve(); }, 5000); })];
                    case 4:
                        _d.sent();
                        return [4 /*yield*/, fetch(this.apiUrl + "/initialize")];
                    case 5:
                        resp = _d.sent();
                        _b = resp.ok;
                        if (!_b) return [3 /*break*/, 7];
                        return [4 /*yield*/, resp.json()];
                    case 6:
                        _b = (_d.sent());
                        _d.label = 7;
                    case 7:
                        initialized = _b;
                        return [3 /*break*/, 3];
                    case 8:
                        this.clientEmit('WALLET_READY');
                        this.channel.addEventListener('message', this.onClientEvent.bind(this));
                        console.log('BLOCKCHAIN:', this.apiUrl);
                        url = this.apiUrl + "/agents/" + this.domain + "/" + this.agentId;
                        console.log('fetching:', url);
                        return [4 /*yield*/, fetch(url)];
                    case 9:
                        resp = _d.sent();
                        if (!resp.ok)
                            throw new Error(resp.status + " - " + resp.statusText);
                        _c = this;
                        return [4 /*yield*/, resp.json()];
                    case 10:
                        _c.agentDef = _d.sent();
                        if (!this.agentDef)
                            throw new Error('AGENT MISSING');
                        if (config.errorLog) {
                            setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
                                var logs, resp;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            logs = this.logs;
                                            this.logs = [];
                                            if (!logs.length)
                                                return [2 /*return*/];
                                            return [4 /*yield*/, fetch(config.errorLog, {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify(logs)
                                                })];
                                        case 1:
                                            resp = _a.sent();
                                            if (!resp.ok)
                                                throw new Error(resp.status + " - " + resp.statusText);
                                            return [2 /*return*/];
                                    }
                                });
                            }); }, 5000);
                        }
                        // console.log('SHOW LOGIN');
                        if (this.agentDef.anonymous)
                            return [2 /*return*/, this.initializeWallet()];
                        if (!config.ephemeral && !this.keyPair)
                            return [2 /*return*/, this.show('home')];
                        _d.label = 11;
                    case 11:
                        _d.trys.push([11, 13, , 14]);
                        return [4 /*yield*/, this.initializeUser()];
                    case 12:
                        _d.sent();
                        this.show('menu');
                        return [3 /*break*/, 14];
                    case 13:
                        e_1 = _d.sent();
                        console.error('Login Error:', e_1.message);
                        this.show('home');
                        return [3 /*break*/, 14];
                    case 14: return [2 /*return*/];
                }
            });
        });
    };
    WalletService.prototype.initializeWallet = function (owner, purse) {
        return __awaiter(this, void 0, void 0, function () {
            var cache, blockchain, run, wallet, channels, ws, Agent, agent;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cache = new run_1["default"].LocalCache({ maxSizeMB: 100 });
                        blockchain = this.blockchain = new rest_blockchain_1.RestBlockchain(fetch.bind(window), this.apiUrl, this.config.network, cache);
                        run = new run_1["default"]({
                            network: this.config.network,
                            owner: owner,
                            blockchain: blockchain,
                            purse: purse,
                            cache: new rest_state_cache_1.RestStateCache(fetch.bind(window), this.apiUrl, cache),
                            app: this.config.app || 'kronoverse',
                            trust: '*',
                            timeout: 60000,
                            logger: {
                                error: console.error
                            }
                        });
                        wallet = this.wallet = new wallet_1.Wallet(this.paymail, this.keyPair, run);
                        channels = [this.keyPair.pubKey.toString()];
                        if (this.config.ephemeral) {
                            console.log('Ephemeral. Listening to owner', run.owner.address);
                            channels.push(run.owner.address);
                        }
                        if (this.config.sockets) {
                            console.log('Sockets:', this.config.sockets);
                            ws = new ws_client_1.WSClient(WebSocket, this.config.sockets, channels);
                        }
                        console.log('DOMAIN:', this.domain);
                        console.log('AGENT_ID:', this.agentId);
                        console.log('LOC:', this.agentDef.location);
                        return [4 /*yield*/, run.load(this.agentDef.location)];
                    case 1:
                        Agent = _a.sent();
                        agent = this.agent = new Agent(wallet, blockchain, null, bsv_2["default"], { fetch: fetch, Buffer: buffer_1.Buffer, ws: ws, SignedMessage: signed_message_1.SignedMessage });
                        agent.on('client', this.clientEmit.bind(this));
                        agent.on('subscribe', function (channel, lastId) {
                            ws.subscribe(channel, lastId);
                        });
                        agent.on('unsubscribe', function (channel) {
                            ws.unsubscribe(channel);
                        });
                        return [4 /*yield*/, agent.init()];
                    case 2:
                        _a.sent();
                        this.clientEmit('AGENT_LOADED');
                        ws.on('jig', function (jig, channel) {
                            console.log('JIG:', JSON.stringify(jig));
                            agent.onJig(jig)["catch"](console.error);
                        });
                        ws.on('msg', function (message, channel) {
                            console.log('MSG:', JSON.stringify(message));
                            agent.onMessage(new signed_message_1.SignedMessage(message))["catch"](console.error);
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    WalletService.prototype.initializeUser = function (handle) {
        return __awaiter(this, void 0, void 0, function () {
            var bip32, xpriv;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('Initializing User');
                        if (handle)
                            this.handle = handle;
                        if (!this.config.ephemeral) return [3 /*break*/, 1];
                        bip32 = bsv_1.Bip32.fromRandom();
                        this.keyPair = bsv_1.KeyPair.fromPrivKey(bip32.privKey);
                        return [3 /*break*/, 3];
                    case 1:
                        console.log('Recovering account');
                        return [4 /*yield*/, this.auth.recover(this.paymail, this.keyPair)];
                    case 2:
                        xpriv = _a.sent();
                        bip32 = bsv_1.Bip32.fromString(xpriv);
                        _a.label = 3;
                    case 3:
                        this.authenticated = true;
                        this.initializeWallet(bip32.derive('m/1/0').privKey.toString(), bip32.derive('m/0/0').privKey.toString());
                        return [2 /*return*/];
                }
            });
        });
    };
    WalletService.prototype.login = function (handle, password) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this;
                        return [4 /*yield*/, this.auth.login(handle, password)];
                    case 1:
                        _a.keyPair = _b.sent();
                        return [4 /*yield*/, this.initializeUser(handle)];
                    case 2:
                        _b.sent();
                        this.show('menu');
                        return [2 /*return*/];
                }
            });
        });
    };
    WalletService.prototype.register = function (handle, password, email) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this;
                        return [4 /*yield*/, this.auth.register(handle, password, email)];
                    case 1:
                        _a.keyPair = _b.sent();
                        return [4 /*yield*/, this.initializeUser(handle)];
                    case 2:
                        _b.sent();
                        this.show('menu');
                        return [2 /*return*/];
                }
            });
        });
    };
    WalletService.prototype.logout = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.authenticated = false;
                window.localStorage.removeItem('WIF');
                window.localStorage.removeItem('HANDLE');
                return [2 /*return*/];
            });
        });
    };
    WalletService.prototype.blockInput = function (x, y, width, height) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                console.log("BlockInput", x, y, width, height);
                this.clientEmit('BlockInput', {
                    x: x, y: y, width: width, height: height
                });
                return [2 /*return*/];
            });
        });
    };
    WalletService.prototype.show = function (viewName, message) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.emit('show', {
                    viewName: viewName,
                    message: message
                });
                return [2 /*return*/];
            });
        });
    };
    WalletService.prototype.onClientEvent = function (event) {
        return __awaiter(this, void 0, void 0, function () {
            var message, response, payload, _a, _b, _c, _d, result, e_2;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        message = {};
                        if (!this.tryParseMessageData(event.data, message))
                            return [2 /*return*/];
                        if (['Register', 'Login'].includes(message.name)) {
                            console.log("WALLET RECEIVED EVENT:", message.name);
                        }
                        else {
                            console.log("WALLET RECEIVED EVENT:", JSON.stringify(message));
                        }
                        response = {
                            name: "On" + message.name
                        };
                        _e.label = 1;
                    case 1:
                        _e.trys.push([1, 14, , 15]);
                        payload = message.payload && JSON.parse(message.payload);
                        _a = message.name;
                        switch (_a) {
                            case 'Register': return [3 /*break*/, 2];
                            case 'Login': return [3 /*break*/, 4];
                            case 'Logout': return [3 /*break*/, 6];
                            case 'Cashout': return [3 /*break*/, 8];
                            case 'IsHandleAvailable': return [3 /*break*/, 9];
                        }
                        return [3 /*break*/, 11];
                    case 2: return [4 /*yield*/, this.register(payload.handle, payload.password, payload.email)];
                    case 3:
                        _e.sent();
                        return [3 /*break*/, 13];
                    case 4: return [4 /*yield*/, this.login(payload.handle, payload.password)];
                    case 5:
                        _e.sent();
                        return [3 /*break*/, 13];
                    case 6: return [4 /*yield*/, this.logout()];
                    case 7:
                        _e.sent();
                        return [3 /*break*/, 13];
                    case 8:
                        if (!this.wallet)
                            throw new Error('Wallet not initialized');
                        // await this.wallet.cashout(payload);
                        this.clientEmit('BalanceUpdated', 0);
                        return [3 /*break*/, 13];
                    case 9:
                        _b = response;
                        _d = (_c = JSON).stringify;
                        return [4 /*yield*/, this.auth.isHandleAvailable(payload)];
                    case 10:
                        _b.payload = _d.apply(_c, [_e.sent()]);
                        return [3 /*break*/, 13];
                    case 11:
                        if (!this.agent)
                            throw new Error('Agent not initialized');
                        return [4 /*yield*/, this.agent.onEvent(message.name, payload)];
                    case 12:
                        result = _e.sent();
                        response.payload = result && JSON.stringify(result);
                        _e.label = 13;
                    case 13:
                        response.success = true;
                        return [3 /*break*/, 15];
                    case 14:
                        e_2 = _e.sent();
                        response.success = false;
                        response.payload = JSON.stringify(e_2.message);
                        if (e_2.message.includes('Not enough funds')) {
                            response.statusCode = 402;
                        }
                        else {
                            response.statusCode = e_2.status || 500;
                        }
                        return [3 /*break*/, 15];
                    case 15:
                        console.log(response.name, response.payload);
                        this.postMessage(response);
                        return [2 /*return*/];
                }
            });
        });
    };
    WalletService.prototype.tryParseMessageData = function (data, outByRef) {
        var message = (outByRef || {});
        if (typeof data === 'string') {
            Object.assign(message, JSON.parse(buffer_1.Buffer.from(data, 'base64').toString()));
        }
        else if (typeof data === 'object') {
            Object.assign(message, data);
        }
        return message && message.name;
    };
    WalletService.prototype.clientEmit = function (name, payload) {
        // console.log('Emitting', name, payload && JSON.stringify(payload));
        var message = {
            name: name,
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
                name: name,
                payload: payload
            }
        });
        this.postMessage(message);
    };
    WalletService.prototype.postMessage = function (message) {
        message.target = 'kronoverse';
        if (this.isInUnity) {
            this.channel.postMessage(message);
        }
        else if (this.channelScope) {
            if (this.channel !== this.channel.parent) {
                this.channel.parent.postMessage(message, this.channelScope);
            }
        }
        if (this.config.emitLogs && !['Log', 'Error'].includes(message.name))
            this.postMessage({
                name: 'Log',
                payload: JSON.stringify(message),
                success: true
            });
    };
    WalletService.prototype.overrideConsole = function () {
        var _this = this;
        console.log = function () {
            var messages = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                messages[_i] = arguments[_i];
            }
            messages.unshift(Date.now());
            var message = messages.join(' ');
            _this.logs.push({
                idx: _this.logId++,
                sessionId: _this.sessionId,
                paymail: _this.paymail,
                type: 'log',
                ts: Date.now(),
                message: message
            });
            if (_this.config.emitLogs)
                _this.clientEmit('Log', message);
            _this.printLog.apply(_this, messages);
        };
        console.error = function () {
            var messages = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                messages[_i] = arguments[_i];
            }
            messages.unshift(Date.now());
            var message = messages.join(' ');
            _this.logs.push({
                idx: _this.logId++,
                sessionId: _this.sessionId,
                paymail: _this.paymail,
                type: 'error',
                ts: Date.now(),
                message: message
            });
            if (_this.config.emitLogs)
                _this.clientEmit('Error', message);
            _this.printError.apply(_this, messages);
        };
        console.time = function (label) {
            _this.timeLabels[label] = Date.now();
        };
        console.timeEnd = function (label) {
            console.log(label + ": " + (Date.now() - _this.timeLabels[label] || 0) + "ms");
        };
    };
    return WalletService;
}(events_1.EventEmitter));
exports.WalletService = WalletService;
//# sourceMappingURL=wallet-service.js.map
"use strict";
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
exports.AuthService = void 0;
var argon2 = require("argon2-browser");
var bsv_1 = require("bsv");
var signed_message_1 = require("@kronoverse/lib/dist/signed-message");
var buffer_1 = require("buffer");
var AuthService = /** @class */ (function () {
    function AuthService(apiUrl, domain, network) {
        this.apiUrl = apiUrl;
        this.domain = domain;
        this.network = network;
    }
    AuthService.prototype.createKey = function (handle, password) {
        return __awaiter(this, void 0, void 0, function () {
            var salt, pass, hash;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, bsv_1.Hash.asyncSha256(buffer_1.Buffer.from(this.domain + "|" + handle))];
                    case 1:
                        salt = _a.sent();
                        return [4 /*yield*/, bsv_1.Hash.asyncSha256(buffer_1.Buffer.from(password.normalize('NFKC')))];
                    case 2:
                        pass = _a.sent();
                        return [4 /*yield*/, argon2.hash({ pass: pass, salt: salt, time: 100, mem: 1024, hashLen: 32 })];
                    case 3:
                        hash = (_a.sent()).hash;
                        return [2 /*return*/, buffer_1.Buffer.from(hash)];
                }
            });
        });
    };
    AuthService.prototype.register = function (handle, password, email) {
        return __awaiter(this, void 0, void 0, function () {
            var keyhash, versionByteNum, keybuf, privKey, keyPair, pubkey, bip32, recoveryBuf, reg, msgBuf, msgHash, sig, resp;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        handle = handle.toLowerCase().normalize('NFKC');
                        return [4 /*yield*/, this.createKey(handle, password)];
                    case 1:
                        keyhash = _a.sent();
                        versionByteNum = this.network === 'main' ?
                            bsv_1.Constants.Mainnet.PrivKey.versionByteNum :
                            bsv_1.Constants.Testnet.PrivKey.versionByteNum;
                        keybuf = buffer_1.Buffer.concat([
                            buffer_1.Buffer.from([versionByteNum]),
                            keyhash,
                            buffer_1.Buffer.from([1]) // compressed flag
                        ]);
                        privKey = new bsv_1.PrivKey().fromBuffer(keybuf);
                        keyPair = bsv_1.KeyPair.fromPrivKey(privKey);
                        pubkey = bsv_1.PubKey.fromPrivKey(privKey);
                        bip32 = bsv_1.Bip32.fromRandom();
                        return [4 /*yield*/, bsv_1.Ecies.asyncBitcoreEncrypt(buffer_1.Buffer.from(bip32.toString()), pubkey, keyPair)];
                    case 2:
                        recoveryBuf = _a.sent();
                        reg = {
                            pubkey: pubkey.toString(),
                            xpub: bip32.toPublic().toString(),
                            recovery: recoveryBuf.toString('base64'),
                            email: email
                        };
                        msgBuf = buffer_1.Buffer.from(this.domain + "|" + handle + "|" + reg.xpub + "|" + reg.recovery + "|" + email);
                        return [4 /*yield*/, bsv_1.Hash.asyncSha256(msgBuf)];
                    case 3:
                        msgHash = _a.sent();
                        sig = bsv_1.Ecdsa.sign(msgHash, keyPair);
                        reg.sig = sig.toString();
                        return [4 /*yield*/, fetch(this.apiUrl + "/api/accounts/" + handle + "@" + this.domain, {
                                method: 'POST',
                                headers: { 'Content-type': 'application/json' },
                                body: JSON.stringify(reg)
                            })];
                    case 4:
                        resp = _a.sent();
                        if (!resp.ok) {
                            console.error(resp.status, resp.statusText);
                            throw new Error('Registration Failed');
                        }
                        return [2 /*return*/, keyPair];
                }
            });
        });
    };
    AuthService.prototype.login = function (handle, password) {
        return __awaiter(this, void 0, void 0, function () {
            var keyhash, versionByteNum, keybuf, privKey;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        handle = handle.toLowerCase().normalize('NFKC');
                        return [4 /*yield*/, this.createKey(handle, password)];
                    case 1:
                        keyhash = _a.sent();
                        versionByteNum = this.network === 'main' ?
                            bsv_1.Constants.Mainnet.PrivKey.versionByteNum :
                            bsv_1.Constants.Testnet.PrivKey.versionByteNum;
                        keybuf = buffer_1.Buffer.concat([
                            buffer_1.Buffer.from([versionByteNum]),
                            keyhash,
                            buffer_1.Buffer.from([1]) // compressed flag
                        ]);
                        privKey = new bsv_1.PrivKey().fromBuffer(keybuf);
                        return [2 /*return*/, bsv_1.KeyPair.fromPrivKey(privKey)];
                }
            });
        });
    };
    AuthService.prototype.recover = function (paymail, keyPair) {
        return __awaiter(this, void 0, void 0, function () {
            var message, resp, recovery, recoveryBuf;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        message = new signed_message_1.SignedMessage({
                            from: keyPair.pubKey.toString()
                        });
                        message.sign(keyPair);
                        return [4 /*yield*/, fetch(this.apiUrl + "/api/accounts/" + encodeURIComponent(paymail) + "/recover", {
                                method: 'POST',
                                headers: { 'Content-type': 'application/json' },
                                body: JSON.stringify(message)
                            })];
                    case 1:
                        resp = _a.sent();
                        if (!resp.ok)
                            throw new Error(resp.status + " - " + resp.statusText);
                        return [4 /*yield*/, resp.json()];
                    case 2:
                        recovery = _a.sent();
                        recoveryBuf = bsv_1.Ecies.bitcoreDecrypt(buffer_1.Buffer.from(recovery, 'base64'), keyPair.privKey);
                        return [2 /*return*/, recoveryBuf.toString()];
                }
            });
        });
    };
    AuthService.prototype.isHandleAvailable = function (handle) {
        return __awaiter(this, void 0, void 0, function () {
            var url, resp, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        handle = handle.toLowerCase();
                        url = this.apiUrl + "/api/bsvalias/id/" + encodeURIComponent(handle) + "@" + this.domain;
                        console.log('Requesting:', url);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, fetch(url)];
                    case 2:
                        resp = _a.sent();
                        return [2 /*return*/, resp.status === 404];
                    case 3:
                        e_1 = _a.sent();
                        console.error('Error Fetching', e_1.message);
                        return [2 /*return*/, false];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return AuthService;
}());
exports.AuthService = AuthService;
//# sourceMappingURL=auth-service.js.map
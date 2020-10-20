"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Mockchain = void 0;
const run_1 = __importDefault(require("@kronoverse/run"));
const events_1 = require("events");
class Mockchain extends run_1.default.Mockchain {
    constructor() {
        super(...arguments);
        this.events = new events_1.EventEmitter();
        this.txns = new Map();
    }
    async broadcast(rawtx) {
        const txid = await super.broadcast(rawtx);
        this.txns.set(txid, rawtx);
        this.events.emit('txn', rawtx);
        return txid;
    }
    async fund(address, satoshis) {
        const txid = await super.fund(address, satoshis);
        const rawtx = await this.fetch(txid);
        this.events.emit('txn', rawtx);
        return txid;
    }
}
exports.Mockchain = Mockchain;
module.exports = Mockchain;
//# sourceMappingURL=mockchain.js.map
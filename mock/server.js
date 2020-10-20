"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const bsv_1 = require("bsv");
const events_1 = require("events");
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const http_error_1 = require("@kronoverse/lib/dist/http-error");
const mockchain_1 = require("./mockchain");
const threads_1 = require("threads");
const run_1 = __importDefault(require("@kronoverse/run"));
const signed_message_1 = require("@kronoverse/lib/dist/signed-message");
const events = new events_1.EventEmitter();
events.setMaxListeners(100);
const jigs = new Map();
const messages = new Map();
const blockchain = new mockchain_1.Mockchain();
const cache = new run_1.default.LocalCache({ maxSizeMB: 100 });
const txns = [];
const channels = new Map();
function publishEvent(channel, event, data) {
    if (!channels.has(channel))
        channels.set(channel, new Map());
    const id = Date.now();
    channels.get(channel).set(id, { event, data });
    events.emit(channel, id, event, data);
}
const app = express_1.default();
const server = http_1.default.createServer(app);
const ws_1 = __importDefault(require("ws"));
const wss = new ws_1.default.Server({ clientTracking: false, noServer: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const mime_types_1 = __importDefault(require("mime-types"));
app.enable('trust proxy');
app.use(cors_1.default());
app.use(express_1.default.json());
app.use((req, res, next) => {
    if (exp.debug)
        console.log('REQ:', req.url);
    next();
});
app.get('/', (req, res) => {
    res.json(true);
});
app.get('/_ah/stop', (req, res) => {
    res.json(true);
    events.emit('shutdown');
});
app.get('/_ah/warmup', (req, res) => {
    res.json(true);
});
app.get('/initialize', async (req, res, next) => {
    res.set('Cache-Control', 'no-store');
    try {
        res.json(exp.initialized);
    }
    catch (e) {
        next(e);
    }
});
app.post('/broadcast', async (req, res, next) => {
    try {
        const { rawtx } = req.body;
        const txid = await blockchain.broadcast(rawtx);
        const indexed = await indexWorker.index(rawtx).catch(console.error);
        (indexed || []).forEach(jigData => {
            jigs.set(jigData.location, jigData);
            publishEvent(jigData.owner, 'jig', jigData);
            publishEvent(jigData.origin, 'jig', jigData);
            if (jigData.kind)
                publishEvent(jigData.kind, 'jig', jigData);
        });
        res.send(txid);
    }
    catch (e) {
        next(e);
    }
});
app.get('/tx/:txid', async (req, res, next) => {
    try {
        const { txid } = req.params;
        const rawtx = await blockchain.fetch(txid);
        if (!rawtx)
            throw new http_error_1.HttpError(404, 'Not Found');
        res.send(rawtx);
    }
    catch (e) {
        next(e);
    }
});
app.get('/utxos/:script', async (req, res, next) => {
    try {
        const { script } = req.params;
        res.json(await blockchain.utxos(script));
    }
    catch (e) {
        next(e);
    }
});
app.get('/spends/:loc', async (req, res, next) => {
    try {
        const [txid, vout] = req.params.loc.split('_o');
        res.send(await blockchain.spends(txid, parseInt(vout, 10)));
    }
    catch (e) {
        next(e);
    }
});
app.get('/fund/:address', async (req, res, next) => {
    try {
        const { address } = req.params;
        const satoshis = parseInt(req.query.satoshis) || 100000000;
        const txid = await blockchain.fund(address, satoshis);
        res.send(txid);
    }
    catch (e) {
        next(e);
    }
});
app.get('/agents/:realm/:agentId', (req, res) => {
    const agent = exp.agents[req.params.agentId];
    if (!agent)
        throw new http_error_1.HttpError(404, 'Not Found');
    res.json(agent);
});
app.get('/jigs', async (req, res, next) => {
    try {
        res.json(Array.from(jigs.values()));
    }
    catch (e) {
        next(e);
    }
});
app.get('/jigs/:loc', async (req, res, next) => {
    try {
        const { loc } = req.params;
        if (jigs.has(loc)) {
            return res.json(jigs.get(loc));
        }
        res.sendStatus(404);
    }
    catch (e) {
        next(e);
    }
});
app.get('/jigs/address/:address', async (req, res, next) => {
    try {
        const { address } = req.params;
        const script = bsv_1.Address.fromString(address).toTxOutScript().toHex();
        const utxos = await blockchain.utxos(script);
        const locs = utxos.map(u => `${u.txid}_o${u.vout}`);
        res.json(locs.map(loc => jigs.get(loc)).filter(jig => jig));
    }
    catch (e) {
        next(e);
    }
});
app.post('/jigs/kind/:kind', async (req, res, next) => {
    try {
        const matching = Array.from(jigs.values()).filter(jig => jig.kind === req.params.kind);
        res.json(matching);
    }
    catch (e) {
        next(e);
    }
});
app.post('/jigs/origin/:origin', async (req, res, next) => {
    try {
        const matching = Array.from(jigs.values()).filter(jig => jig.origin === req.params.origin);
        res.json(matching);
    }
    catch (e) {
        next(e);
    }
});
app.get('/messages/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const message = messages.get(id);
        if (!message)
            throw new http_error_1.HttpError(404, 'Not Found');
        res.json(message);
    }
    catch (e) {
        next(e);
    }
});
app.post('/messages', async (req, res, next) => {
    try {
        const message = new signed_message_1.SignedMessage(req.body);
        messages.set(message.id, message);
        message.to.forEach((to) => {
            publishEvent(to, 'msg', message);
        });
        message.context.forEach(context => {
            publishEvent(context, 'msg', message);
        });
        publishEvent(message.subject, 'msg', message);
        res.json(true);
    }
    catch (e) {
        next(e);
    }
});
app.get('/state/:key', async (req, res, next) => {
    try {
        const { key } = req.params;
        const value = await cache.get(key);
        if (!value)
            throw new http_error_1.HttpError(404, 'Not Found');
        res.json(value);
    }
    catch (e) {
        next(e);
    }
});
server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
    });
});
wss.on('connection', (ws, req) => {
    ws.on('message', (message) => {
        const { action, channelId } = JSON.parse(message);
        if (action !== 'subscribe')
            return;
        events.on(channelId, (id, event, data) => {
            ws.send(JSON.stringify({
                id,
                channel: channelId,
                event,
                data
            }));
        });
    });
});
app.get('/config', (req, res, next) => {
    res.json({
        network: 'testnet',
        apiUrl: `http://localhost:8082`,
        sockets: 'ws://localhost:8082/v1',
        ephemeral: true,
        emitLogs: true,
        app: 'local',
        errorLog: false
    });
});
app.use('/wallet', express_1.default.static(path_1.default.join(__dirname, '../client/public')), (req, res, next) => {
    let pathToFile = path_1.default.join(__dirname, '../client', "index.html");
    let data = fs_1.default.readFileSync(pathToFile);
    let cType = mime_types_1.default.lookup(pathToFile);
    cType && res.set("Content-Type", cType);
    res.write(data);
    res.end();
});
app.get('/txns', async (req, res, next) => {
    res.json(await Promise.all(txns.map(txid => blockchain.fetch(txid))));
});
app.post('/:agentId', async (req, res, next) => {
    const agent = exp.agents[req.params.agentId];
    if (agent && agent.onMessage) {
        const result = await agent.onMessage(req.body);
        res.json(result);
    }
    else {
        res.sendStatus(204);
    }
});
app.use((err, req, res, next) => {
    console.error(err.message, err.statusCode !== 404 && err.stack);
    res.status(err.statusCode || 500).send(err.message);
});
let indexWorker;
async function listen(port) {
    indexWorker = await threads_1.spawn(new threads_1.Worker('./indexer'));
    return new Promise((resolve, reject) => {
        // const PORT = process.env.PORT || 8082;
        server.listen(port, () => {
            console.log(`App listening on port ${port}`);
            console.log('Press Ctrl+C to quit.');
            resolve();
        });
    });
}
async function close() {
    server.close();
}
const exp = {
    debug: true,
    agents: {},
    blockchain,
    events,
    listen,
    close,
    initialized: false,
    jigs,
    txns,
    cache,
    publishEvent,
};
exports.default = exp;
blockchain.events.on('txn', async (rawtx) => {
    blockchain.block();
    const tx = bsv_1.Tx.fromHex(rawtx);
    const txid = tx.id();
    txns.push(txid);
});
// Testing Stuff
// let PORT = process.env.MOCKPORT === undefined ? 8082 : process.env.MOCKPORT;
// (async () => {
//     app.listen(PORT,() => {
//         console.log(`Server listening on port ${PORT}`);
//     })
// })();
//# sourceMappingURL=server.js.map
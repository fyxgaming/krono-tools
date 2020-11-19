const { Tx } = require('bsv');
const { RestBlockchain } = require('@kronoverse/lib/dist/rest-blockchain');
const Run = require('@kronoverse/run');

const { expose } = require('threads/worker');
const fetch = require('node-fetch');

const PORT = process.env.PORT || 8082;
const network = 'mock';
const apiUrl = `http://localhost:${PORT}`;
const blockchain = new RestBlockchain(fetch, apiUrl, network);
const run = new Run({
    network,
    blockchain,
    timeout: 30000,
    trust: '*',
    // logger: console
});

async function indexJig(loc) {
    if (!loc) return;
    try {
        console.log('Indexing:', loc);
        const jig = await run.load(loc).catch(e => {
            if (e.message.includes('Jig does not exist') ||
                e.message.includes('Not a run transaction')
            ) return;
            throw e;
        });
        if (!jig) return;
        console.log('JIG:', jig.name || (jig.constructor && jig.constructor.name), jig.location);
        const jigData = {
            location: jig.location,
            kind: jig.constructor && jig.constructor.origin,
            type: jig.constructor && jig.constructor.name,
            origin: jig.origin, 
            owner: jig.owner,
            ts: Date.now(),
            isOrigin: jig.location === jig.origin,
        };
        jigData.value = JSON.parse(JSON.stringify(jig.toObject ? jig.toObject() : {}));
        // console.log('Serialized:', jigData.value);
        return jigData;
    } catch (e) {
        console.error('INDEX ERROR:', e);
        // throw e;
    }
}

expose({
    index: async (rawtx) => {
        const tx = Tx.fromHex(rawtx);
        const txid = tx.id();

        let payload;
        try {
            payload = run.payload(rawtx);
        } catch (e) {
            if (e.message.includes('Bad payload structure') || e.message.includes('Not a run transaction')) return;
            throw e;
        }
        const locs = payload.out.map((x, i) => `${txid}_o${i + 1}`);
        const jigs = [];
        if(locs.length) {
            jigs.push(await indexJig(locs.shift()));
            jigs.push(...(await Promise.all(locs.map((loc) => indexJig(loc)))));
        }
        return jigs;
    },
    getState: () => {
        const results = {};
        for(const [loc, state] of run.cache.xa.entries()) {
            results[loc] = state;
        }
        return results;
    }
});
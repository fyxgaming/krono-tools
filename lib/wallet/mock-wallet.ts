import { Blockchain } from '../blockchain';
import { IAgent } from '../interfaces';

const { crypto } = require('bsv');
export default class Wallet {
    private agent: any;
    private agentDef: IAgent;
    private blockchain: Blockchain;
    pubkey: string;
    address: string;
    transaction: any;
    storage = new Map<string, any>();

    constructor(
        private run: any
    ) {
        this.blockchain = run.blockchain;

        this.transaction = run.transaction;
        this.pubkey = run.owner.pubkey;
        this.address = run.owner.address;

        console.log(`ADDRESS: ${this.address}`);
        console.log(`PUBKEY: ${this.pubkey}`);
    }

    get bsvNetwork() {
        switch (this.blockchain.network) {
            case 'main':
                return 'mainnet';
            case 'stn':
                return 'stn';
            default:
                return 'testnet';
        }
    }

    async initializeAgent(agentDef: IAgent) {
        this.agentDef = agentDef;
        console.log('AGENT:', agentDef.agent, agentDef.location);
        const AgentClass = await this.run.load(agentDef.location);
        this.agent = new AgentClass(this, this.blockchain);
        await this.callHandler(this.agent.initialize);
    }

    startListener() {
        this.blockchain.on(this.address, (loc) => {
            const jig = this.loadJig(loc);
            if (!jig) return;
            this.processJig(jig);
        });
    }

    // async serverEmit(recipient: string, name: string, payload?: any, context?: string) {
    //     const address = new PublicKey(recipient)
    //         .toAddress(this.bsvNetwork)
    //         .toString();

    //     console.log('Emitting', name, address);
    //     const message: any = {
    //         messageId: `${Date.now()}-${this.randomInt(Number.MAX_SAFE_INTEGER)}`,
    //         name,
    //         ts: Date.now()
    //     };
    //     if (context !== undefined) {
    //         message.context = context;
    //     }
    //     if (payload !== undefined) {
    //         message.payload = JSON.stringify(payload);
    //     }
    //     return this.db.collection('addresses')
    //         .doc(address)
    //         .collection('messages')
    //         .add(message);
    // }

    async callHandler(handler: any, payload?: any) {
        if (!handler) return;
        console.log('Calling', handler.name);
        const result = await handler.call(this.agent, payload);
        return result;
    }

    async handleEvent(handlerName: string, payload?: any): Promise<any> {
        const handler = this.agent[handlerName];
        return this.callHandler(handler, payload);
    }

    // async scheduleHandler(delaySeconds: number, handler: any, payload?: any) {
    //     const client = new CloudTasksClient();
    //     const body = JSON.stringify({ handler, payload });
    //     const task = {
    //         appEngineHttpRequest: {
    //             httpMethod: 'POST',
    //             relativeUri: `/${this.agentDef.agent}/event`,
    //             body: Buffer.from(body).toString('base64'),
    //             headers: {
    //                 'Content-Type': 'application/json'
    //             }
    //         },
    //         scheduleTime: {
    //             seconds: delaySeconds + Date.now() / 1000
    //         }
    //     };
    //     console.log('Scheduling', body);
    //     await client.createTask({ parent: this.config.QUEUE_PATH, task });
    // }

    async processJig(jig) {
        await this.callHandler(this.agent.onJig, jig);
    }

    async loadJig(loc: string) {
        // console.log('Loading', loc);
        const jig = await this.run.load(loc)
            .catch((e) => {
                if (e.message.includes('not a run tx') ||
                    e.message.includes('not a jig output') ||
                    e.message.includes('Not a token')
                ) {
                    console.log('Not a jig:', loc);
                    return;
                }
                console.error('Load error:', e.message);
                throw e;
            });
        return jig;
    }

    // private jigsRef() {

    //     return this.db
    //         .collection('addresses').doc(this.address)
    //         .collection('jigs')
    //         .where('spent', '==', 0);
    // }

    // async jigByOrigin(origin: string) {
    //     const snap = await this.jigsRef()
    //         .where('origin', '==', origin)
    //         .get();

    //     if (snap.empty) return;
    //     return this.loadJig(snap.docs[0].id);
    // }

    // async jigsByKind(kind: string) {
    //     const locs = await this.locsByKind(kind);
    //     const jigs: any[] = [];
    //     for (const loc of locs) {
    //         jigs.push(await this.loadJig(loc));
    //     }
    //     return jigs;
    // }

    // async locsByKind(kind: string): Promise<string[]> {
    //     const snap = await this.jigsRef()
    //         .where('kind', '==', kind)
    //         .get();

    //     return snap.docs.map(doc => doc.id);
    // }

    async jigs() {
        const startTime = Date.now();
        const utxos = await this.blockchain.utxos(this.address);
        console.log('UTXOS:', utxos.length);
        const jigs = [];
        for (const utxo of utxos) {
            const jig = await this.loadJig(utxo._id);
            if (!jig) continue;
            await jig.sync();
            if (jig.owner === this.pubkey) {
                jigs.push(jig);
            }
        }
        console.log('Load Jigs:', jigs.length, (Date.now() - startTime) / 1000, 'seconds');
        return jigs;
    }

    async isSpent(loc: string) {
        const [txid, pos] = loc.split('_');
        const tx = await this.blockchain.fetch(txid);
        const vout = parseInt(pos.substr(1), 10);
        return !!tx.outputs[vout].spentTxId;
    }

    // async kindHistory(kind: string, req: any) {
    //     const query = (!req.address ?
    //         this.db.collectionGroup('jigLog') :
    //         this.db.collection('addresses').doc(req.address).collection('jigLog')
    //     ).where('kind', '==', kind);

    //     const snap = await this.buildHistoryQuery(query, req).get();
    //     return snap.docs.map(doc => doc.id);
    // }

    // async originHistory(origin: string, params: any) {
    //     const query = (!params.address ?
    //         this.db.collectionGroup('jigLog') :
    //         this.db.collection('addresses').doc(params.address).collection('jigLog')
    //     ).where('origin', '==', origin);
    //     const snap = await this.buildHistoryQuery(query, params).get();
    //     return snap.docs.map(doc => doc.id);
    // }

    // private buildHistoryQuery(ref: Query, params: any) {
    //     let query = ref.where('timestamp', '>=', params.fromTime)
    //         .where('timestamp', '<=', params.toTime)
    //         .orderBy('timestamp', params.direction);
    //     if (params.limit) {
    //         query = query.limit(params.limit);
    //     }
    //     return query;
    // }

    async get(key: string) {
        return this.storage.get(key);
    }

    async set(key: string, value: any) {
        return this.storage.set(key, value);
    }

    randomInt(max) {
        return Math.floor(Math.random() * (max || Number.MAX_SAFE_INTEGER));
    }

    randomBytes(size: number) {
        return crypto.Random.getRandomBuffer(size).toString('hex');
    }

    async generateHashchain(key: string, size: number): Promise<string> {
        const hashchain = new Array<string>(size);
        let hash = hashchain[size - 1] = this.randomBytes(32);
        for (let i = size - 2; i >= 0; i--) {
            hash = hashchain[i] = this.sha256(hash);
        }
        await this.set(`hc_${key}`, { hashchain });
        return this.sha256(hashchain[0]);
    }

    async hashchainValue(key: string, index: number) {
        const { hashchain } = await this.get(`hc_${key}`);
        if (!hashchain) {
            throw new Error('Invalid hashchain');
        }
        return hashchain[index];
    }

    timestamp() {
        return Date.now();
    }

    sha256(hex: string) {
        return crypto.Hash.sha256(Buffer.from(hex, 'hex')).toString('hex');
    }

    sync() {
        return this.run.sync();
    }
}

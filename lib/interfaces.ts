import { Transaction } from 'bsv';

export interface IAgent {
    agent: string;
    location: string;
    address?: string;
    derivationPath?: string;
    anonymous?: boolean;
}

export interface IUTXO {
    _id: string;
    address: string;
    txid: string;
    vout: number;
    script: string;
    satoshis: number;
    ts: number;
}

export interface IJig {
    _id?: string;
    location: string;
    owner: string;
    origin: string;
    kind?: string;
    type?: string;
    ts: number;
    isOrigin: boolean;
    KRONO_CHANNEL?: {
        loc: string,
        seq: number
    };
    sync?: (options?: any) => Promise<void>
}

export interface IJigHistory {
    save(jig: IJig): Promise<void>;
    queryLocation(locs: string[]): Promise<IJig[]>;
    queryKind(kind: string, query: IJigQuery): Promise<string[]>;
    queryOrigin(origin: string, query: IJigQuery): Promise<string[]>;
}

export interface IJigQuery {
    owner?: string;
    from: number;
    to: number;
    limit?: number;
    offset?: number;
    isOrigin?: boolean;
}

export interface IStorage<T> {
    get(key: string): Promise<T>;
    set(key: string, value: T): Promise<void>;
    delete(key: string): Promise<void>;
}

export type TxData = Omit<Transaction, 'outputs'> & {
    outputs: (Transaction.Output & {
        spentTxId: string | null,
        spentIndex: number | null
        // time: number
    });

    address: string;
    loc: string;
    seq: number;
    spent: any;
    time: number;
    recipients?: string[];
}

export interface IAction {
    loc: string;
    seq?: number;
    name: string;
    payload?: any;
    hash: string;
    sig: string;
}

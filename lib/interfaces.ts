import { SignedMessage } from "./signed-message";

export interface IJigData {
    location: string;
}

export interface IChannel {
}

export interface IAgent {
    onJig(jigData: IJigData): Promise<any>;
    // onChannel(jigData: IChannel): Promise<any>;
    // onKindSub(jigData: IJigData): Promise<any>;
    // onOriginSub(jigData: IJigData): Promise<any>;
    // onChannelSub(jigData: IChannel): Promise<any>;
    onEvent(type: string, payload: any): Promise<any>;
    onMessage(message: SignedMessage): Promise<any>;
}

export interface IAgentDef {
    agent: string;
    location: string;
    // address?: string;
    // derivationPath?: string;
    anonymous?: boolean;
}

export interface IUTXO {
    loc: string;
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
}

export interface IAction {
    loc: string;
    seq?: number;
    name: string;
    payload?: any;
    hash: string;
    sig: string;
}

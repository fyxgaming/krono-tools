import { Bw, Ecdsa, Hash, KeyPair, PubKey, Sig } from 'bsv2';
const MAGIC_BYTES = Buffer.from('Bitcoin Signed Message:\n');
const MAGIC_BYTES_PREFIX = Bw.varIntBufNum(MAGIC_BYTES.length);

export class SignedMessage {
    from: string = '';
    to: string[] = [];
    reply: string = '';
    subject: string = '';
    payload: string = '';
    ts: number = 0;
    sig?: string;

    constructor(message: Partial<SignedMessage>) {
        Object.assign(this, message);
    }

    get hash() {
        const payloadBuf = Buffer.concat([
            Buffer.from(this.to.join(':')),
            Buffer.from(this.reply),
            Buffer.from(this.subject),
            Bw.varIntBufNum(this.ts),
            Buffer.from(this.payload)
        ]);
        const messageBuf = Buffer.concat([
            MAGIC_BYTES_PREFIX,
            MAGIC_BYTES,
            Bw.varIntBufNum(payloadBuf.length),
            payloadBuf
        ]);
        return Hash.sha256Sha256(messageBuf);
    }

    get payloadObj() {
        return this.payload && JSON.parse(this.payload);
    }

    async sign(keyPair: KeyPair) {
        this.sig = (await Ecdsa.asyncSign(this.hash, keyPair)).toString();
    }

    async verify(paymailClient?) {
        let pubkey;
        if(this.from.includes('@')) {
            if(!paymailClient) throw new Error('paymailClient required');
            pubkey = await paymailClient.getPublicKey(this.from)
        } else {
            pubkey = this.from;
        }
        return Ecdsa.asyncVerify(this.hash, Sig.fromString(this.sig), PubKey.fromString(pubkey));
    }
    
}
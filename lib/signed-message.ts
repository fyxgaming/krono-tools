import { Bw, Ecdsa, Ecies, Hash, KeyPair, PubKey, Random, Sig } from 'bsv';
const MAGIC_BYTES = Buffer.from('Bitcoin Signed Message:\n');
const MAGIC_BYTES_PREFIX = Bw.varIntBufNum(MAGIC_BYTES.length);

export class SignedMessage {
    from: string;
    to: string[];
    subject: string;
    payload: string;
    ts: number;
    sig: string;

    constructor(message) {
        Object.assign(this, message);
    }

    get hash() {
        return SignedMessage.hash(this);
    }

    get payloadObj() {
        return this.payload && JSON.parse(this.payload);
    }

    async sign(keyPair: KeyPair) {
        this.sig = await Ecdsa.asyncSign(this.hash, keyPair).toString();
    }

    async verify(message: SignedMessage, paymailClient?) {
        let pubkey;
        if(this.from.includes('@')) {
            if(!paymailClient) throw new Error('paymailClient required');
            pubkey = await paymailClient.getPublicKey(this.from)
        } else {
            pubkey = this.from;
        }
        return Ecdsa.asyncVerify(this.hash, Sig.fromString(this.sig), PubKey.fromString(pubkey));
    }

    static hash({ to, payload, subject, ts }: Partial<SignedMessage>): Buffer {
        const payloadBuf = Buffer.concat([
            Buffer.from(to.join(':')),
            Buffer.from(subject),
            Bw.varIntBufNum(ts),
            Buffer.from(payload, 'hex')
        ]);
        const messageBuf = Buffer.concat([
            MAGIC_BYTES_PREFIX,
            MAGIC_BYTES,
            Bw.varIntBufNum(payloadBuf.length),
            payloadBuf
        ]);
        return Hash.sha256Sha256(messageBuf);
    }

    
}
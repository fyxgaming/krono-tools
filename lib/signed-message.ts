import { Bw, Ecdsa, Hash, KeyPair, PubKey, Sig } from 'bsv';
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
        return SignedMessage.hash(this);
    }

    get payloadObj() {
        return this.payload && JSON.parse(this.payload);
    }

    async sign(keyPair: KeyPair) {
        this.sig = await Ecdsa.asyncSign(this.hash, keyPair).toString();
    }

    async verify(paymailClient?) {
        return SignedMessage.verify(this, paymailClient);
    }

    static async verify(message: SignedMessage, paymailClient?) {
        let pubkey;
        if(message.from.includes('@')) {
            if(!paymailClient) throw new Error('paymailClient required');
            pubkey = await paymailClient.getPublicKey(message.from)
        } else {
            pubkey = message.from;
        }
        return Ecdsa.asyncVerify(this.hash, Sig.fromString(message.sig), PubKey.fromString(pubkey));
    }

    static hash({ to, subject, reply, payload, ts }: Partial<SignedMessage>): Buffer {
        const payloadBuf = Buffer.concat([
            Buffer.from(to.join(':')),
            Buffer.from(reply),
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
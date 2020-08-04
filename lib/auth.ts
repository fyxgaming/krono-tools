import * as argon2 from 'argon2-browser';
import { Bip32, Constants, Ecdsa, Ecies, Hash, KeyPair, PrivKey, PubKey } from 'bsv';
import { SignedMessage } from './signed-message';

const fetch = require('node-fetch');

export class KronoAuth {
    constructor(private apiUrl: string, public domain: string, private network: string) {}

    async createKey(handle, password) {
        const salt = await Hash.asyncSha256(Buffer.from(`${this.domain}|${handle}`));
        const pass = await Hash.asyncSha256(Buffer.from(password.normalize('NFKC')));
        const { hash } = await argon2.hash({ pass, salt, time: 100, mem: 1024, hashLen: 32 });
        return Buffer.from(hash);
    }

    async register(handle: string, password: string, email: string): Promise<string> {
        handle = handle.toLowerCase().normalize('NFKC');
        const keyhash = await this.createKey(handle, password);

        const versionByteNum = this.network === 'main' ?
            Constants.Mainnet.PrivKey.versionByteNum :
            Constants.Testnet.PrivKey.versionByteNum;
        const keybuf = Buffer.concat([
            Buffer.from([versionByteNum]),
            keyhash,
            Buffer.from([1]) // compressed flag
        ]);
        const privKey = new PrivKey().fromBuffer(keybuf);
        const keyPair = KeyPair.fromPrivKey(privKey);
        const pubkey = PubKey.fromPrivKey(privKey);
        const bip32 = Bip32.fromRandom();

        const recoveryBuf = await Ecies.asyncBitcoreEncrypt(
            Buffer.from(bip32.toString()),
            pubkey,
            keyPair
        );
        const reg: any = {
            pubkey: pubkey.toString(),
            xpub: bip32.toPublic().toString(),
            recovery: recoveryBuf.toString('base64'),
            email
        };

        const msgBuf = Buffer.from(`${this.domain}|${handle}|${reg.xpub}|${reg.recovery}|${email}`);
        const msgHash = await Hash.asyncSha256(msgBuf);
        const sig = Ecdsa.sign(msgHash, keyPair);
        reg.sig = sig.toString();

        const resp = await fetch(`${this.apiUrl}/api/accounts/${handle}@${this.domain}`, {
            method: 'POST',
            headers: { 'Content-type': 'application/json' },
            body: JSON.stringify(reg)
        });
        if (!resp.ok) {
            console.error(resp.status, resp.statusText);
            throw new Error('Registration Failed');
        }

        return keyPair;
    }

    async login(handle: string, password: string): Promise<string> {
        handle = handle.toLowerCase().normalize('NFKC');
        const keyhash = await this.createKey(handle, password);

        const versionByteNum = this.network === 'main' ?
            Constants.Mainnet.PrivKey.versionByteNum :
            Constants.Testnet.PrivKey.versionByteNum;
        const keybuf = Buffer.concat([
            Buffer.from([versionByteNum]),
            keyhash,
            Buffer.from([1]) // compressed flag
        ]);
        
        const privKey = new PrivKey().fromBuffer(keybuf);
        return KeyPair.fromPrivKey(privKey);
    }

    async recover(paymail: string, keyPair: KeyPair) {
        const message = new SignedMessage({
          from: paymail
        });
        
        message.sign(keyPair);
        const resp = await fetch(`${this.apiUrl}/api/accounts/${paymail}/recover`, {
            method: 'POST',
            headers: { 'Content-type': 'application/json' },
            body: JSON.stringify(message)
        });
        if (!resp.ok) throw new Error(`${resp.status} - ${resp.statusText}`);
        const recovery = await resp.json();
        const recoveryBuf = Ecies.bitcoreDecrypt(
            Buffer.from(recovery, 'base64'),
            keyPair.privKey
        );
        return recoveryBuf.toString();
    }

    public async isHandleAvailable(handle: string) {
        handle = handle.toLowerCase();
        const resp = await fetch(`${this.apiUrl}/api/bsvalias/id/${handle}@${this.domain}`);
        return resp.status === 404;
    }
}
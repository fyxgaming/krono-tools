import * as argon2 from 'argon2-browser';
import { Bip32, Constants, Ecdsa, Ecies, Hash, KeyPair, PrivKey, PubKey } from 'bsv';
import { SignedMessage } from '@kronoverse/lib/dist/signed-message';
import { Buffer } from 'buffer';
export class AuthService {
    constructor(apiUrl, domain, network) {
        this.apiUrl = apiUrl;
        this.domain = domain;
        this.network = network;
    }
    async createKey(handle, password) {
        const salt = await Hash.asyncSha256(Buffer.from(`${this.domain}|${handle}`));
        const pass = await Hash.asyncSha256(Buffer.from(password.normalize('NFKC')));
        const { hash } = await argon2.hash({ pass, salt, time: 100, mem: 1024, hashLen: 32 });
        return Buffer.from(hash);
    }
    async register(handle, password, email) {
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
        const recoveryBuf = await Ecies.asyncBitcoreEncrypt(Buffer.from(bip32.toString()), pubkey, keyPair);
        const reg = {
            pubkey: pubkey.toString(),
            xpub: bip32.toPublic().toString(),
            recovery: recoveryBuf.toString('base64'),
            email
        };
        const msgBuf = Buffer.from(`${this.domain}|${handle}|${reg.xpub}|${reg.recovery}|${email}`);
        const msgHash = await Hash.asyncSha256(msgBuf);
        const sig = Ecdsa.sign(msgHash, keyPair);
        reg.sig = sig.toString();
        const url = `${this.apiUrl}/api/accounts/${handle}@${this.domain}`;
        console.log(url);
        const resp = await fetch(url, {
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
    async login(handle, password) {
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
    async recover(paymail, keyPair) {
        const message = new SignedMessage({
            subject: 'Recover'
        }, keyPair);
        const url = `${this.apiUrl}/api/accounts/${encodeURIComponent(paymail)}/recover`;
        console.log(url);
        const resp = await fetch(url, {
            method: 'POST',
            headers: { 'Content-type': 'application/json' },
            body: JSON.stringify(message)
        });
        if (!resp.ok) {
            if (resp.status === 403)
                throw new Error(`${resp.status} - Invalid Credentials`);
            throw new Error(`${resp.status} - ${resp.statusText}`);
        }
        const recovery = await resp.json();
        const recoveryBuf = Ecies.bitcoreDecrypt(Buffer.from(recovery, 'base64'), keyPair.privKey);
        return recoveryBuf.toString();
    }
    async isHandleAvailable(handle) {
        handle = handle.toLowerCase();
        const url = `${this.apiUrl}/api/bsvalias/id/${encodeURIComponent(handle)}@${this.domain}`;
        console.log('Requesting:', url);
        try {
            const resp = await fetch(url);
            return resp.status === 404;
        }
        catch (e) {
            console.error('Error Fetching', e.message);
            return false;
        }
    }
}
//# sourceMappingURL=auth-service.js.map
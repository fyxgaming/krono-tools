import axios from 'axios';
import * as argon2 from 'argon2-browser';
import { Bip32, Constants, Ecies, Hash, KeyPair, PrivKey } from 'bsv';
import { SignedMessage } from '@kronoverse/lib/dist/signed-message';
import { Buffer } from 'buffer';

export class AuthService {
    constructor(private apiUrl: string, private network: string) { }

    async generateKeyPair(id: string, password: string): KeyPair {
        id = id.toLowerCase().normalize('NFKC');
        const salt = Hash.sha256(Buffer.from(id));
        const pass = Hash.sha256(Buffer.from(password.normalize('NFKC')));
        const { hash } = await argon2.hash({ pass, salt, time: 100, mem: 1024, hashLen: 32 });

        const versionByteNum = this.network === 'main' ?
            Constants.Mainnet.PrivKey.versionByteNum :
            Constants.Testnet.PrivKey.versionByteNum;
        const keybuf = Buffer.concat([
            Buffer.from([versionByteNum]),
            hash,
            Buffer.from([1]) // compressed flag
        ]);
        const privKey = new PrivKey().fromBuffer(keybuf);
        return KeyPair.fromPrivKey(privKey);
    }

    async register(id: string, password: string, email: string): Promise<string> {
        const keyPair = this.generateKeyPair(id, password);
        const bip32 = Bip32.fromRandom();

        const recoveryBuf = await Ecies.asyncBitcoreEncrypt(
            Buffer.from(bip32.toString()),
            keyPair.pubKey,
            keyPair
        );
        const reg: any = {
            pubkey: keyPair.pubkey.toString(),
            xpub: bip32.toPublic().toString(),
            recovery: recoveryBuf.toString('base64'),
            email
        };

        const resp = await axios.post(`${this.apiUrl}/accounts`, new SignedMessage({
            subject: 'Register',
            payload: JSON.stringify({
                id,
                xpub: bip32.toPublic().toString(),
                recovery: recoveryBuf.toString('base64'),
                email
            })
        }, keyPair));

        return keyPair;
    }

    async recover(id: string, keyPair: KeyPair) {
        const { data: { path, recovery }} = await axios.post(`${this.apiUrl}/accounts`, new SignedMessage({
            subject: 'Recover'
        }), keyPair);
        
        const recoveryBuf = Ecies.bitcoreDecrypt(
            Buffer.from(recovery, 'base64'),
            keyPair.privKey
        );
        return {
            xpriv: recoveryBuf.toString(),
            path
        };
    }

    public async isHandleAvailable(handle: string) {
        try {
            await axios(`${this.apiUrl}/accounts/${handle}`)
            return false;
        } catch (e) {
            if(e.status === 404) return true;
            throw e;
        }
    }
}
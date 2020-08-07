const { Jig } = require('@kronoverse/run');

class KronoJig extends Jig {
    toObject(skipKeys) {
        return KronoClass.deepClone(this, skipKeys);
    }

    static toObject() {
        const clone = Array.isArray(this) ? [] : {};
        Object.keys(this)
            .filter(key => {
                return key !== 'deps' &&
                    !key.match(/.+Testnet/) &&
                    !key.match(/.+Mainnet/) &&
                    !key.match(/.+Stn/)
            })
            .forEach(key => clone[key] = this[key]);
        return clone;
    }

    dispose() {
        this.satoshis = 546;
        this.owner = DisposeConfig.pubkey;
    }

    authenticate() {
        if (!this.authCount) {
            this.authCount = 0;
        }
        this.authCount++;
    }

    // beginChannel() {
    //     this.KRONO_CHANNEL = {
    //         loc: this.location,
    //         seq: 1
    //     }
    // }

    // incrementChannel() {
    //     this.KRONO_CHANNEL.seq++;
    // }

    // endChannel() {
    //     delete this.KRONO_CHANNEL;
    // }

    static deepClone(obj, skipKeys) {
        return KronoClass.deepClone(obj, skipKeys);
    }
}

KronoJig.asyncDeps = {
    KronoClass: 'lib/krono-class.js',
    DisposeConfig: 'config/{env}/dispose.js'
}

module.exports = KronoJig;
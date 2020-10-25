const {Token, Transaction} = require('@kronoverse/run');

class KronoCoin extends Token {
    toObject(skipKeys = [], visited = new Set()) {
        if(visited.has(this)) return;
        visited.add(this);
        const clone = Object.entries(this).reduce((clone, [key, value]) => {
            if([...skipKeys, 'deps', 'presets'].includes(key)) return clone;
            clone[key] = KronoClass.deepClone(value, [], new Set(visited));
            return clone;
        }, {})
        return clone;
    }

    static async postDeploy() {
        const t = new Transaction();
        t.update(() => {
            for(let i = 0; i < 10; i++) {
                const coin = KronoCoin.mint(100000000000);
                coin.send(KronoCoin.deps.CashierConfig.address);
            }
        });
        await t.publish();
    }
}

KronoCoin.decimals = 6;
KronoCoin.asyncDeps = {
    CashierConfig: 'config/{env}/cashier-config.js',
    KronoClass: 'lib/krono-class.js',
}

module.exports = KronoCoin;
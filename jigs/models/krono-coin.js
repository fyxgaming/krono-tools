const {Token, Transaction} = require('@kronoverse/run');
class KronoCoin extends Token {
    static async postDeploy() {
        const t = new Transaction();
        t.update(() => {
            for(let i = 0; i < 10; i++) {
                const coin = KronoCoin.mint(1000000000);
                coin.send(KronoCoin.deps.CashierConfig.address);
            }
        });
        await t.publish();
    }
}

KronoCoin.decimals = 4;
KronoCoin.asyncDeps = {
    CashierConfig: 'config/{env}/cashier-config.js'
}

module.exports = KronoCoin;
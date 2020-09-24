const {Token, Transaction} = require('@kronoverse/run');
const CashierConfig = require('../config/mock/cashier-config');
class KronoCoin extends Token {
    static async postDeploy() {
        const t = new Transaction();
        // t.update(() => {
            for(let i = 0; i < 10; i++) {
                const coin = new KronoCoin(1000000000);
                await coin.sync();
                coin.send(CashierConfig.address);
                await coin.sync();
            }
        // });
        // await t.publish();
    }
}

KronoCoin.decimals = 4;
KronoCoin.asyncDeps = {
    CashierConfig: 'config/{env}/cashier-config.js'
}

module.exports = KronoCoin;
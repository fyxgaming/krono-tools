const CashierConfig = require('../config/dev/cashier-config');
const KronoJig = require('../lib/krono-jig');

/* global CashierConfig, KronoCoin */
class CashOut extends KronoJig {
    init(coins, paymentAmount) {
        const total = coins.reduce((acc, coin) => acc + coin.amount, 0);
        if(total < amount) throw new Error('Inadequate Balance');
        this.coins = coins;
        this.paymentAmount = paymentAmount;
    }
    
    execute() {
        if(this.coins.length == 1) {
            this.coin = coins[0];
        } else {
            this.coin = new KronoCoin(coins);
        }
        delete this.coins;
        this.coin.send(CashierConfig.address, this.paymentAmount);
        this.owner = CashierConfig.address;
    }
}

CashOut.asyncDeps = {
    CashierConfig: 'config/{env}/cashier-config.js',
    KronoJig: 'lib/krono-jig.js',
    KronoCoin: 'models/krono-coin.js'
}

module.exports = CashOut;
const CashierConfig = require('../config/dev/cashier-config');
const FyxJig = require('../lib/fyx-jig');

/* global CashierConfig, FyxCoin */
class CashOut extends FyxJig {
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
            this.coin = new FyxCoin(coins);
        }
        delete this.coins;
        this.coin.send(CashierConfig.address, this.paymentAmount);
        this.owner = CashierConfig.address;
    }
}

CashOut.asyncDeps = {
    CashierConfig: 'config/{env}/cashier-config.js',
    FyxJig: 'lib/fyx-jig.js',
    FyxCoin: 'models/fyx-coin.js'
}

module.exports = CashOut;
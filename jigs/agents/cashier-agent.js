const Agent = require('../lib/agent');
const KronoCoin = require('../models/krono-coin');

class CashierAgent extends Agent {
    init() {
        this.messageHandlers.set('FundsRequest', this.onFundsRequest);
    }

    onFundsRequest(message) {
        const index = await this.wallet.loadJigIndex();
        const amount = (this.wallet.randomInt(100) + 1) * 10000;
        const coins = [];
        let acc = 0;
        for (coinData of index.filter(data => data.kind === KronoCoin.origin)) {
            const coin = await this.wallet.loadJig(coinData.location);
            coins.push(coin);
            if (acc += coin.amount > amount) break;
        }

        const t = this.wallet.createTransaction();
        t.update(() => {
            let coin;
            if(coins.length > 1) {
                coin = KronoCoin.combine(...coins);
            } else {
                coin = coins[0];
            }
            coin.send(message.payloadObj.dest, amount);
        });
        await t.publish();
    }
}

CashierAgent.asyncDeps = {
    KronoCoin: 'models/krono-coin.js'
}
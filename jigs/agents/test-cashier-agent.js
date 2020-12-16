const KronoCoin = require('../models/krono-coin');
const CashierAgent = require('./cashier-agent');

class TestCashierAgent extends CashierAgent {
    async onCashInRequest(message) {
        const coin = await this.sendCoin(message.payloadObj.owner, 25000000);
        await coin.sync();
        console.log('Coin:', coin.location, coin.amount);
    }
}

TestCashierAgent.asyncDeps = {
    CashierAgent: 'agents/cashier-agent.js',
    KronoCoin: 'models/krono-coin.js',
}

module.exports = TestCashierAgent;
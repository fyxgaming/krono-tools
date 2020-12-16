const CashierAgent = require('./cashier-agent');

class TestCashierAgent extends CashierAgent {
    async onCashInRequest(message) {
        const coin = KronoCoin.mint(25000000, message.payloadObj.owner);
        await coin.sync();
        console.log('Coin:', coin.location);
    }
}

TestCashierAgent.asyncDeps = {
    CashierAgent: 'agents/cashier-agent.js',
    KronoCoin: 'models/krono-coin.js',
}

module.exports = TestCashierAgent;
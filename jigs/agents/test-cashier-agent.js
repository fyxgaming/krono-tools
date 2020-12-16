const CashierAgent = require('./cashier-agent');

class TestCashierAgent extends CashierAgent {
    async onCashInRequest(message) {
        const t = this.wallet.createTransaction();
        let coin;
        t.update(() => {
            coin = KronoCoin.mint(25000000);
            coin.send(message.payloadObj.owner);
        });
        await t.publish();
        console.log('Coin:', coin.location);
    }
}

TestCashierAgent.asyncDeps = {
    CashierAgent: 'agents/cashier-agent.js',
    KronoCoin: 'models/krono-coin.js',
}

module.exports = TestCashierAgent;
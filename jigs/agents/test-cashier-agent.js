const CashierAgent = require('./cashier-agent');

class TestCashierAgent extends CashierAgent {
    async onCashInRequest(message) {
        const t = this.wallet.createTransaction();
        t.update(() => {
            const coin = new KronoCoin(25000000);
            coin.send(message.payloadObj.owner);
        });
        await t.publish();
    }
}

TestCashierAgent.asyncDeps = {
    CashierAgent: 'agents/cashier-agent.js',
    KronoCoin: 'models/krono-coin.js',
}

module.exports = TestCashierAgent;
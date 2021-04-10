const CashierAgent = require('./cashier-agent');

class TestCashierAgent extends CashierAgent {
    async onCashInRequest(message) {
        const coin = await this.sendCoin(message.payloadObj.owner, 25000000);
        await coin.sync();
        console.log('Coin:', coin.location, coin.amount);
        return {...coin};
    }
}

TestCashierAgent.asyncDeps = {
    CashierAgent: 'agents/cashier-agent.js',
    FyxCoin: 'models/fyx-coin.js',
};

module.exports = TestCashierAgent;
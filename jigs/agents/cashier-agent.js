const Agent = require('../lib/agent');
const Payment = require('../models/payment');

/* global Payment, KronoCoin */
class CashierAgent extends Agent {
    async createPayment(paymentId, payer) {
        const payment = new Payment(paymentId, payer);
        await payment.sync();
        return payment;
    }
    
    async completePayment(location, amount) {
        const payment = await this.wallet.loadJig(location);
        if(!payment) throw new Error('Payment not found');
        payment.complete(amount);
        await payment.sync();
    }
}

CashierAgent.asyncDeps = {
    Agent: 'lib/agent.js',
    KronoCoin: 'models/krono-coin.js',
    Payment: 'models/payment.js'
}

module.exports = CashierAgent;
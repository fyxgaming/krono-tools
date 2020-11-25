const Agent = require('../lib/agent');
const Payment = require('../models/payment');

/* global CashierConfig, KronoCoin, Payment */
class CashierAgent extends Agent {
    async init() {
        this.messageHandlers.set('CreatePayment', this.createPayment);
        this.messageHandlers.set('CompletePayment', this.completePayment);
    }

    async createPayment(message) {
        if(message.from !== CashierConfig.pubkey) throw new KronoError(403, 'Access Denied');
        const { paymentId, payer } = message.payloadObj;
        const payment = new Payment(paymentId, payer);
        await payment.sync();
        const response = this.wallet.buildMessage({
            reply: message.id,
            payload: JSON.stringify({location: payment.location})
        });
        return response;
    }
    
    async completePayment(message) {
        if(message.from !== CashierConfig.pubkey) throw new KronoError(403, 'Access Denied');
        const { location, amount } = message.payloadObj;
        const payment = await this.wallet.loadJig(location);
        if(!payment) throw new Error('Payment not found');
        payment.complete(amount);
        await payment.sync();
    }
}

CashierAgent.asyncDeps = {
    Agent: 'lib/agent.js',
    CashierConfig: 'config/{env}/cashier-config.js',
    KronoCoin: 'models/krono-coin.js',
    KronoError: 'lib/krono-error.js',
    Payment: 'models/payment.js'
}

module.exports = CashierAgent;
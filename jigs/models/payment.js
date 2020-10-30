const KronoJig = require('../lib/krono-jig');

/* global KronoCoin */
class Payment extends KronoJig {
    init(payer, paymentId) {
        this.paymentId = paymentId;
        this.payer = payer;
    }

    complete(amount) {
        const coin = KronoCoin.mint(amount);
        coin.send(this.payer);
        this.destory();
    }
}

Payment.asyncDeps = {
    KronoCoin: 'models/krono-coin.js'
}

module.exports = Payment;
const KronoJig = require('../lib/krono-jig');

/* global KronoCoin */
class Payment extends KronoJig {
    init(paymentId, payer) {
        this.paymentId = paymentId;
        this.payer = payer;
    }

    complete(amount) {
        const coin = KronoCoin.mint(amount);
        coin.send(this.payer);
        this.destroy();
    }
}

Payment.asyncDeps = {
    KronoJig: 'lib/krono-jig.js',
    KronoCoin: 'models/krono-coin.js'
}

module.exports = Payment;
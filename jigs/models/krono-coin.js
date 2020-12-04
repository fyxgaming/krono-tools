const { Token } = require('@kronoverse/run');

/* global KronoClass */
class KronoCoin extends Token {
    setPayment(payment) {
        this.payment = payment;
    }

    static mint(amount) {
        const coin = super.mint(amount);
        coin.setPayment(caller);
        return coin;
    }
    
    static transfer(owner) {
        this.owner = owner;
    }
}

KronoCoin.postDeploy = async () => {
    KronoCoin.transfer(KronoCoin.deps.CashierConfig.address);
    await KronoCoin.sync();
}

KronoCoin.decimals = 6;
KronoCoin.asyncDeps = {
    CashierConfig: 'config/{env}/cashier-config.js',
    KronoClass: 'lib/krono-class.js',
    Token: 'models/token2.js'
}

module.exports = KronoCoin;
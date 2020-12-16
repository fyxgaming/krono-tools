const { Token20 } = require('@kronoverse/run').extra;

/* global KronoClass */
class KronoCoin extends Token20 {
    // setPayment(payment) {
    //     this.payment = payment;
    // }

    // static mint(amount) {
    //     const coin = super.mint(amount);
    //     if(caller) coin.setPayment(caller);
    //     return coin;
    // }
    
    static transfer(owner) {
        this.owner = owner;
    }

    static async postDeploy() {
        this.transfer(this.deps.CashierConfig.address);
        await this.sync();
    }
}


KronoCoin.decimals = 6;
KronoCoin.asyncDeps = {
    CashierConfig: 'config/{env}/cashier-config.js',
    KronoClass: 'lib/krono-class.js'
}

module.exports = KronoCoin;
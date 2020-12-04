const Token = require('./token2');

/* global KronoClass */
class KronoCoin extends Token {
    setPayment(payment) {
        this.payment = payment;
    }

    setAddress(address) {
        this.address = address;
    }

    send(address, amount = this.amount, owner = this.owner) {
        const currentAddress = this.address;
        this.setAddress(address);
        const change = super.send(owner, amount);
        change.setAddress(currentAddress);
        return change;
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
    this.transfer(this.deps.CashierConfig.address);
    await this.sync();
}

KronoCoin.decimals = 6;
KronoCoin.asyncDeps = {
    CashierConfig: 'config/{env}/cashier-config.js',
    KronoClass: 'lib/krono-class.js',
    Token: 'models/token2.js'
}

module.exports = KronoCoin;
const {Token, Transaction} = require('@kronoverse/run');

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

    toObject(skipKeys = [], visited = new Set()) {
        if(visited.has(this)) return;
        visited.add(this);
        return KronoClass.cloneChildren(this, skipKeys, visited);
    }

    static async postDeploy(deployer) {
        console.log('Token Owner:', this.deps.CashierConfig.address);
        this.transfer(this.deps.CashierConfig.address);
        await this.sync();
    }
}

KronoCoin.decimals = 6;
KronoCoin.asyncDeps = {
    CashierConfig: 'config/{env}/cashier-config.js',
    KronoClass: 'lib/krono-class.js',
}

module.exports = KronoCoin;
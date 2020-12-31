const { Token20 } = require('@kronoverse/run').extra;
const {Transaction} = require('@kronoverse/run');

/* global KronoClass */
class KronoCoin extends Token20 {
    setPaymentId(paymentId) {
        this.paymentId = paymentId;
    }

    toObject(skipKeys = [], visited = new Set()) {
        if(visited.has(this)) return;
        visited.add(this);
        return KronoClass.cloneChildren(this, skipKeys, visited);
    }
}

KronoCoin.postDeploy = async (deployer) => {
    const { CashierConfig } = KronoCoin.deps;
    const [coin] = await deployer.blockchain.jigIndex(
        CashierConfig.address, 
        {
            criteria: {kind: KronoCoin.origin},
            project: {value: false}
        }
    );
    if(!coin) {
        const t = new Transaction();
        t.update(() => {
            console.log('Minting Coins');
            for(let i = 0; i < 10; i++) {
                KronoCoin.mint(1000000000000, CashierConfig.address);
            }
        });
        await t.publish();
    }
};

KronoCoin.decimals = 6;
KronoCoin.asyncDeps = {
    CashierConfig: 'config/{env}/cashier-config.js',
    KronoClass: 'lib/krono-class.js'
};

module.exports = KronoCoin;
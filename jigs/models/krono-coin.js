const { Token20 } = require('@kronoverse/run').extra;
const {Transaction} = require('@kronoverse/run');

/* global KronoClass */
class KronoCoin extends Token20 {
    setPaymentId(paymentId) {
        this.paymentId = paymentId;
    }

    static async postDeploy(deployer) {
        const { CashierConfig } = this.deps;
        const [coin] = await deployer.blockchain.jigIndex(
            CashierConfig.address, 
            {
                criteria: {kind: this.origin},
                project: {value: false}
            }
        );
        if(!coin) {
            const t = new Transaction();
            t.update(() => {
                console.log('Minting Coins');
                for(let i = 0; i < 10; i++) {
                    this.mint(1000000000000, CashierConfig.address);
                }
            });
            await t.publish();
        }
    }
}


KronoCoin.decimals = 6;
KronoCoin.asyncDeps = {
    CashierConfig: 'config/{env}/cashier-config.js',
    KronoClass: 'lib/krono-class.js'
}

module.exports = KronoCoin;
const axios = require('axios');
const { Token20 } = require('run-sdk').extra;
const {Transaction} = require('run-sdk');

const {SignedMessage} = require('@kronoverse/lib/dist/signed-message');


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
    const { data: [coin]} = await axios.post(`${deployer.apiUrl}/jigs/cashier`, new SignedMessage({
        payload: JSON.stringify({
            criteria: {kind: KronoCoin.origin},
            project: {value: false}
        })
    }, deployer.userId, deployer.keyPair));

    if(!coin) {
        const t = new Transaction();
        t.update(() => {
            console.log('Minting Coins');
            for(let i = 0; i < 10; i++) {
                KronoCoin.mint(1000000000000, KronoCoin.dep.CashierConfig.address);
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

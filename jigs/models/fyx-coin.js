const axios = require('axios');
const { Token20 } = require('run-sdk').extra;
const {Transaction} = require('run-sdk');

const {SignedMessage} = require('@kronoverse/lib/dist/signed-message');


/* global FyxClass */
class FyxCoin extends Token20 {
    setPaymentId(paymentId) {
        this.paymentId = paymentId;
    }

    toObject(skipKeys = [], visited = new Set()) {
        if(visited.has(this)) return;
        visited.add(this);
        return FyxClass.cloneChildren(this, skipKeys, visited);
    }
}

FyxCoin.postDeploy = async (deployer) => {
    const { CashierConfig } = FyxCoin.deps;
    const { data: [coin]} = await axios.post(`${deployer.apiUrl}/jigs/cashier`, new SignedMessage({
        payload: JSON.stringify({
            criteria: {kind: FyxCoin.origin},
            project: {value: false}
        })
    }, deployer.userId, deployer.keyPair));

    if(!coin) {
        const t = new Transaction();
        t.update(() => {
            console.log('Minting Coins');
            for(let i = 0; i < 10; i++) {
                FyxCoin.mint(1000000000000, CashierConfig.address);
            }
        });
        await t.publish();
    }
};

FyxCoin.decimals = 6;
FyxCoin.asyncDeps = {
    CashierConfig: 'config/{env}/cashier-config.js',
    FyxClass: 'lib/fyx-class.js'
};

module.exports = FyxCoin;

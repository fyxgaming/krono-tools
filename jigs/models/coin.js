const { Token } = require('@kronoverse/run');

class Coin extends Token { }
Coin.decimals = 4;
Coin.asyncDeps = {
    CashierConfig: 'config/{env}/cashier.js'
}

Coin.postDeploy = (deployer) => {
    deployer.run.transaction.begin();
    let coin = new Coin(1000000000);
    for (let i = 0; i < 10; i++) {
        coin = coin.send(Coin.deps.CashierConfig.pubkey, 100000000);
    }
    deployer.run.transaction.end();
}

module.exports = Coin;

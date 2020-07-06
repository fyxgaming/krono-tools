const KronoJig = require('../lib/krono-jig');

class FundsRequest extends KronoJig {
    init() {
        this.recipient = this.owner;
        this.owner = Config.pubkey;
    }

    fulfill(coin) {
        coin.send(this.recipient, 500000);
        this.dispose();
    }
}

FundsRequest.asyncDeps = {
    Config: 'config/{env}/cashier.js',
    KronoJig: 'lib/krono-jig.js'
};

module.exports = FundsRequest;
const KronoJig = require('../lib/krono-jig');

/* global caller */
class KronoItem extends KronoJig {
    init(item, owner) {
        this.item = item;

        this.mint = caller;
        this.minter = caller && caller.owner;

        this.owner = owner;
    }

    transfer(recipient) {
        this.owner = recipient;
    }
}

KronoItem.asyncDeps = {
    KronoJig: 'lib/krono-jig.js'
};

module.exports = KronoItem;
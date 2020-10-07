const KronoJig = require('../lib/krono-jig');

class KronoItem extends KronoJig {
    init(itemDef, owner) {
        this.itemDef = itemDef;

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
}

module.exports = KronoItem;
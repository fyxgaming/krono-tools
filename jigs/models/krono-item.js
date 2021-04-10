const Config = require('../config/config');
const KronoJig = require('../lib/krono-jig');

/* global caller */
class KronoItem extends KronoJig {
    init(item, owner, metadata = {}, satoshis = Config.defaultSatoshis) {
        this.item = item;
        this.mint = caller;
        this.minter = caller && caller.owner;
        this.metadata = {
            ...metadata,
            ...Config.defaultMetadata
        };
        this.satoshis = satoshis;
        this.owner = owner;
    }

    transfer(recipient) {
        this.owner = recipient;
    }
}

KronoItem.transferrable = true;
KronoItem.asyncDeps = {
    Config: 'config/config.js',
    KronoJig: 'lib/krono-jig.js'
};

module.exports = KronoItem;
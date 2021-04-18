const Config = require('../config/config');
const FyxJig = require('../lib/fyx-jig');

/* global caller */
class FyxItem extends FyxJig {
    init(owner, metadata = {}, item, satoshis = Config.minSatoshis) {
        this.item = item;

        this.mint = {
            location: caller && caller.location,
            origin: caller && caller.origin,
            kind: caller && caller.constructor && caller.constructor.location,
            owner: caller && caller.owner,
            nonce: caller && caller.nonce
        };

        this.metadata = {
            ...metadata,
            ...Config.defaultMetadata
        };
        this.satoshis = satoshis;
        this.owner = owner;
    }
}

FyxItem.metadata = {
    name: 'Fyx Item',
    emoji: '📦'
};

FyxItem.transferrable = true;
FyxItem.asyncDeps = {
    Config: 'config/config.js',
    FyxJig: 'lib/fyx-jig.js'
};

module.exports = FyxItem;
const Config = require('../config/config');
const FyxJig = require('../lib/fyx-jig');

/* global caller */
class FyxItem extends FyxJig {
    init(owner, metadata = {}, item, satoshis = Config.minSatoshis) {
        this.item = item;

        this.mint = {
            origin: caller && caller.origin,
            kind: caller && caller.constructor && caller.constructor.origin,
            owner: caller && caller.owner
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
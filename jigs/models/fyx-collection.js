const Config = require('../config/config');
const FyxJig = require('../lib/fyx-jig');
const FyxItem = require('./fyx-item');

class FyxCollection extends FyxJig {
    init(owner, metadata = {}) {
        this.metadata = {
            ...metadata,
            ...Config.defaultMetadata
        };
        this.owner = owner;
    }

    mint(owner, metadata = {}, item, satoshis) {
        new FyxItem(owner, metadata, item, satoshis);
    }
}

FyxCollection.metadata = {
    name: 'Fyx Collection',
    emoji: '📦'
};

FyxCollection.transferrable = true;
FyxCollection.asyncDeps = {
    Config: 'config/config.js',
    FyxItem: 'models/fyx-item.js',
    FyxJig: 'lib/fyx-jig.js'
};

module.exports = FyxCollection;
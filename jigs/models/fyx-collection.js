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

    mint(supply, owner, metadata = {}, item, satoshis) {
        metadata.supply = supply;
        for(let i = 0; i < supply; i++) {
            metadata.index = i + 1;
            new FyxItem(owner, metadata, item, satoshis);
        }
    }

    static async deploy (deployer, prev) {
        if(!prev) {
            console.log('Deploying');
            return deployer.run.deploy(Fighter);
        } else {
            console.log('Upgrading');
            prev.upgrade(Fighter);
            await prev.sync();
            return prev;
        }
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
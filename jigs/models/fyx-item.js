const Config = require('../config/config');
const FyxJig = require('../lib/fyx-jig');

/* global caller */
class FyxItem extends FyxJig {
    init(owner, metadata = {}, item, satoshis) {
        this.item = item;

        this.mint = {
            origin: caller && caller.origin,
            type: caller && caller.constructor,
            owner: caller && caller.owner
        };

        this.metadata = {
            ...metadata,
            ...Config.defaultMetadata
        };
        if(satoshis) this.satoshis = satoshis;
        this.owner = owner;
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
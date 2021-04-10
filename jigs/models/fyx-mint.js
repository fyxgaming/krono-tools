const FyxJig = require('../lib/fyx-jig');

/* global FyxItem */
class FyxMint extends FyxJig {
    mint(item) {
        return new FyxItem(item);
    }
}

FyxMint.asyncDeps = {
    FyxJig: 'lib/fyx-jig.js',
    FyxItem: 'models/fyx-item.js'
};

module.exports = FyxMint;
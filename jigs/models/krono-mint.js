const KronoJig = require('../lib/krono-jig');

/* global KronoItem */
class KronoMint extends KronoJig {
    mint(item) {
        return new KronoItem(item);
    }
}

KronoMint.asyncDeps = {
    KronoJig: 'lib/krono-jig.js',
    KronoItem: 'models/krono-item.js'
};

module.exports = KronoMint;
class Catalog { }

Catalog.realm = 'kronoverse';
Catalog.agents = [];

Catalog.asyncDeps = {
    Agent: 'lib/agent.js',
    // jsbn: 'lib/jsbn.js',
    Dice: 'lib/dice.js',
    JigMap: 'models/jig-map.js',
    JigSet: 'models/jig-set.js',
    KronoClass: 'lib/krono-class.js',
    KronoItem: 'models/krono-item.js',
    KronoJig: 'lib/krono-jig.js',
    KMath: 'lib/math.js',
    Sha256: 'lib/sha256.js',
    // SigVerifier: 'lib/sig-verifier.js'
};

module.exports = Catalog;
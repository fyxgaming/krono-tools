class Catalog { 
    static preDeploy(deployer) {
        this.agents = {
            "coin": Catalog.deps.KronoCoin,
        }
    }
}

Catalog.realm = 'dev.kronoverse.io';

Catalog.asyncDeps = {
    Agent: 'lib/agent.js',
    Dice: 'lib/dice.js',
    EventEmitter: 'lib/event-emitter.js',
    JigMap: 'models/jig-map.js',
    JigSet: 'models/jig-set.js',
    KronoCoin: 'models/krono-coin.js',
    KronoClass: 'lib/krono-class.js',
    KronoError: 'lib/krono-error.js',
    KronoItem: 'models/krono-item.js',
    KronoJig: 'lib/krono-jig.js',
    // KMath: 'lib/math.js',
    MockDice: 'lib/mock-dice.js',
    Sha256: 'lib/sha256.js',
};

module.exports = Catalog;
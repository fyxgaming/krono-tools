class Catalog { 
    static preDeploy(deployer) {
        this.agents = {
            // "cashier": Catalog.deps.CashierAgent,
        }
    }
}

Catalog.realm = 'adhoc.kronoverse.io';

Catalog.asyncDeps = {
    Agent: 'lib/agent.js',
    // jsbn: 'lib/jsbn.js',
    // CashierAgent: 'agents/cashier-agent.js',
    // CashierConfig: 'config/{env}/cashier-config.js',
    Dice: 'lib/dice.js',
    EventEmitter: 'lib/event-emitter.js',
    JigMap: 'models/jig-map.js',
    JigSet: 'models/jig-set.js',
    KronoClass: 'lib/krono-class.js',
    KronoError: 'lib/krono-error.js',
    KronoItem: 'models/krono-item.js',
    KronoJig: 'lib/krono-jig.js',
    // KMath: 'lib/math.js',
    MockDice: 'lib/mock-dice.js',
    Sha256: 'lib/sha256.js',
    // SigVerifier: 'lib/sig-verifier.js'
};

module.exports = Catalog;
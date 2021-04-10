class Catalog { 
    static preDeploy(deployer) {
        this.agents = {
            "cashier": Catalog.deps.CashierAgent,
        }
    }
}

Catalog.realm = 'kronoverse.io';

Catalog.asyncDeps = {
    Agent: 'lib/agent.js',
    // jsbn: 'lib/jsbn.js',
    CashierAgent: 'agents/cashier-agent.js',
    CashierConfig: 'config/{env}/cashier-config.js',
    Dice: 'lib/dice.js',
    EventEmitter: 'lib/event-emitter.js',
    JigMap: 'models/jig-map.js',
    JigSet: 'models/jig-set.js',
    FyxClass: 'lib/fyx-class.js',
    FyxError: 'lib/fyx-error.js',
    FyxItem: 'models/fyx-item.js',
    FyxJig: 'lib/fyx-jig.js',
    // KMath: 'lib/math.js',
    MockDice: 'lib/mock-dice.js',
    Sha256: 'lib/sha256.js',
    // SigVerifier: 'lib/sig-verifier.js'
};

module.exports = Catalog;
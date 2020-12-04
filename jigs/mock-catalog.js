class Catalog {}

Catalog.realm = 'local';
Catalog.agents = {};

Catalog.asyncDeps = {
    Agent: 'lib/agent.js',
    CashierConfig: 'config/{env}/cashier-config.js',
    Dice: 'lib/dice.js',
    EventEmitter: 'lib/event-emitter.js',
    JigMap: 'models/jig-map.js',
    JigSet: 'models/jig-set.js',
    KronoCoin: 'models/krono-coin.js',
    KronoClass: 'lib/krono-class.js',
    KronoError: 'lib/krono-error.js',
    KronoItem: 'models/krono-item.js',
    KronoJig: 'lib/krono-jig.js',
    MockDice: 'lib/mock-dice.js',
    Payment: 'models/payment.js',
    Sha256: 'lib/sha256.js',
};

module.exports = Catalog;
class Catalog {}

Catalog.fyxId = 'fyx';

Catalog.asyncDeps = {
    Agent: 'lib/agent.js',
    CashierAgent: 'agents/test-cashier-agent.js',
    CashierConfig: 'config/{env}/cashier-config.js',
    Dice: 'lib/dice.js',
    EventEmitter: 'lib/event-emitter.js',
    FyxCoin: 'models/fyx-coin.js',
    FyxClass: 'lib/fyx-class.js',
    FyxError: 'lib/fyx-error.js',
    FyxItem: 'models/fyx-item.js',
    FyxMint: 'models/fyx-mint.js',
    FyxJig: 'lib/fyx-jig.js',
    JigMap: 'models/jig-map.js',
    JigSet: 'models/jig-set.js',
    OrderLock: 'lib/order-lock.js',
    Math: 'lib/math.js',
    MockDice: 'lib/mock-dice.js',
    Sha256: 'lib/sha256.js',
};

module.exports = Catalog;
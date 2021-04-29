const FyxClass = require('../lib/fyx-class');

class KVStore extends FyxClass {
    static set(key, value) {
        this[key] = value;
    }
}

KVStore.asyncDeps = {
    FyxClass: 'lib/fyx-class.js'
};

KVStore.transferrable = false;
KVStore.sealed = false;
module.exports = KVStore;

const FyxJig = require('../lib/fyx-jig');
class KVStore extends FyxJig {
    static set(key, value) {
        this[key] = value;
    }
}

KVStore.asyncDeps = {
    FyxJig: 'lib/fyx-jig.js'
};

KVStore.transferrable = false;
KVStore.sealed = false;
module.exports = KVStore;

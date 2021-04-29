const FyxClass = require('../lib/fyx-class');

class KVStore extends FyxClass {
    static setValue(key, value) {
        this.data[key] = value;
    }
}

KVStore.data = {};
KVStore.asyncDeps = {
    FyxClass: 'lib/fyx-class.js'
};

KVStore.transferrable = false;
KVStore.sealed = false;
module.exports = KVStore;

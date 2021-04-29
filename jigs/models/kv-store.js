const FyxClass = require('../lib/fyx-class');

class KVStore extends FyxClass {
    static set(key, value) {
        this.map.set(key, value);
    }

    static toObject(skipKeys = [], visited = new Set()) {
        if(visited.has(this)) return;
        const output = {};
        for(let [key, value] of Object.entries(this.map)) {
            if(skipKeys.includes(key)) continue;
            output[key] = this.deepClone(value, [], visited);
        }
        return output;
    }
}

KVStore.map = new Map();
KVStore.asyncDeps = {
    FyxClass: 'lib/fyx-class.js'
};

KVStore.transferrable = false;
KVStore.sealed = false;
module.exports = KVStore;

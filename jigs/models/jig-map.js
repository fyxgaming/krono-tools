const FyxJig = require('../lib/fyx-jig');

class JigMap extends FyxJig {
    init(map) {
        this.map = map || {};
    }

    has(key) {
        return Boolean(this.map[key]);
    }

    set(key, value) {
        this.map[key] = value;
    }

    unset(key) {
        delete this.map[key];
    }
}

JigMap.asyncDeps = {
    FyxJig: 'lib/fyx-jig.js'
};

module.exports = JigMap;
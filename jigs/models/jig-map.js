const KronoJig = require('../lib/krono-jig');

class JigMap extends KronoJig {
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
    KronoJig: 'lib/krono-jig.js'
};

module.exports = JigMap;
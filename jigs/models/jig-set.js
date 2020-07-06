const KronoJig = require('../lib/krono-jig');

class JigSet extends KronoJig {
    init(values = []) {
        this.clear();
        values.forEach(value => this.index[value] = true)
    }

    clear() {
        this.index = {};
    }

    has(value) {
        return Boolean(this.index[value]);
    }

    add(value) {
        if (!this.index[value]) {
            this.index[value] = true;
        }
    }

    delete(value) {
        delete this.index[value];
    }

    values() {
        return Object.keys(this.index);
    }
}

JigSet.asyncDeps = {
    KronoJig: 'lib/krono-jig.js'
};

module.exports = JigSet;
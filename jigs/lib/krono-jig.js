const { Jig } = require('@kronoverse/run');

class KronoJig extends Jig {
    toObject(skipKeys) {
        return KronoClass.deepClone({...this}, skipKeys);
    }

    static toObject() {
        const clone = Array.isArray(this) ? [] : {};
        Object.keys(this)
            .filter(key => !['deps', 'presets'].includes(key))
            .forEach(key => clone[key] = this[key]);
        return clone;
    }

    static deepClone(obj, skipKeys) {
        return KronoClass.deepClone(obj, skipKeys);
    }
}

KronoJig.asyncDeps = {
    KronoClass: 'lib/krono-class.js',
    DisposeConfig: 'config/{env}/dispose.js'
}

KronoJig.sealed = false;
module.exports = KronoJig;
const { Jig } = require('@kronoverse/run');
const KronoClass = require('@kronoverse/tools/jigs/lib/krono-class');

class KronoJig extends Jig {
    toObject(skipKeys = [], visited = new Set()) {
        if(visited.has(this)) return;
        visited.add(this);
        const clone = Object.entries(this).reduce((clone, [key, value]) => {
            if([...skipKeys, 'deps', 'presets'].includes(key)) return clone;
            clone[key] = KronoClass.deepClone(value, [], new Set(visited));
            return clone;
        }, {})
        return clone;
    }

    static toObject(skipKeys = [], visited = new Set()) {
        if(visited.has(this)) return;
        visited.add(this);
        const clone = Object.entries(this).reduce((clone, [key, value]) => {
            if([...skipKeys, 'deps', 'presets'].includes(key)) return clone;
            clone[key] = KronoClass.deepClone(value, [], new Set(visited));
            return clone;
        }, {})
        return clone;
    }

    static deepClone(obj, skipKeys, visited = new Set()) {
        return KronoClass.deepClone(obj, skipKeys, visited);
    }
}

KronoJig.asyncDeps = {
    KronoClass: 'lib/krono-class.js'
}

KronoJig.sealed = false;
module.exports = KronoJig;
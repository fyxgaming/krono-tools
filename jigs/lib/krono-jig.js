const { Jig } = require('@kronoverse/run');
const KronoClass = require('./krono-class');

class KronoJig extends Jig {
    toObject(skipKeys = [], visited = new Set()) {
        if(visited.has(this)) return;
        visited.add(this);
        return KronoClass.cloneChildren(this, skipKeys, visited);
    }

    static toObject(skipKeys = [], visited = new Set()) {
        if(visited.has(this)) return;
        visited.add(this);
        return KronoClass.cloneChildren(this, skipKeys, visited);
    }
}

KronoJig.asyncDeps = {
    KronoClass: 'lib/krono-class.js'
}

KronoJig.sealed = false;
module.exports = KronoJig;
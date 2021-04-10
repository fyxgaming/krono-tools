const { Jig } = require('run-sdk');
const KronoClass = require('./krono-class');

class KronoJig extends Jig {
    send(owner) {
        if(!this.constructor.transferrable) throw new Error('Jig not transferrable');
        this.owner = owner;
    }

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
};

KronoJig.transferrable = false;
KronoJig.sealed = false;
module.exports = KronoJig;
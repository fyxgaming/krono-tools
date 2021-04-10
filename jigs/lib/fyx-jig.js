const { Jig } = require('run-sdk');
const FyxClass = require('./fyx-class');

class FyxJig extends Jig {
    send(owner) {
        if(!this.constructor.transferrable) throw new Error('Jig not transferrable');
        this.owner = owner;
    }

    toObject(skipKeys = [], visited = new Set()) {
        if(visited.has(this)) return;
        visited.add(this);
        return FyxClass.cloneChildren(this, skipKeys, visited);
    }

    static toObject(skipKeys = [], visited = new Set()) {
        if(visited.has(this)) return;
        visited.add(this);
        return FyxClass.cloneChildren(this, skipKeys, visited);
    }
}

FyxJig.asyncDeps = {
    FyxClass: 'lib/fyx-class.js'
};

FyxJig.transferrable = false;
FyxJig.sealed = false;
module.exports = FyxJig;
const KronoJig = require('../lib/krono-jig');

class JigStack extends KronoJig {
    init(stack) {
        this.stack = stack || [];
    }

    push(value) {
        this.stack.push(value);
    }

    pop() {
        return this.stack.pop();
    }
}

JigStack.asyncDeps = {
    KronoJig: 'lib/krono-jig.js'
};

module.exports = JigStack;
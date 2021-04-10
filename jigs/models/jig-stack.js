const FyxJig = require('../lib/fyx-jig');

class JigStack extends FyxJig {
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
    FyxJig: 'lib/fyx-jig.js'
};

module.exports = JigStack;
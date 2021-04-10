const FyxJig = require('../lib/fyx-jig');

/**
 * token2.js
 *
 * Token2 jig that provides ERC-20 like support. Compared to Token1:
 *
 * - send() returns the change and sends the original
 * - combine() merges tokens together to allow batch combine and send
 */
class Token2 extends Jig {
    init () {
        // The base Token2 class cannot be created on its own
        if (Object.getPrototypeOf(this.constructor) === Jig) {
            throw new Error('Token2 must be extended')
        }
        // Case: Mint
        if (caller === this.constructor) {
            this._checkAmount(caller.mintAmount)
            this.amount = caller.mintAmount
            this.sender = null
            return
        }
        // Case: Change
        if (caller && caller.constructor === this.constructor) {
            this._checkAmount(caller.changeAmount)
            this.amount = caller.changeAmount
            this.owner = caller.owner
            this.sender = caller.sender
            return
        }
        throw new Error('Must create Token using mint')
    }
    static mint (amount) {
        this.mintAmount = amount
        const token = new this()
        delete this.mintAmount
        this.supply += amount
        return token
    }
    destroy () {
        super.destroy()
        this.amount = 0
        this.sender = null
    }
    send (to, amount = this.amount) {
        this._checkAmount(amount)
        if (amount > this.amount) {
            throw new Error('Not enough funds')
        }
        let change = null
        if (amount < this.amount) {
            this.changeAmount = this.amount - amount
            change = new this.constructor()
            delete this.changeAmount
        }
        this.amount = amount
        this.sender = this.owner
        this.owner = to
        return change
    }
    combine (...tokens) {
        if (!Array.isArray(tokens) || tokens.length < 1) {
            throw new Error('Invalid tokens to combine')
        }
        // Each token to combine must all be of this type
        if (tokens.some(token => token.constructor !== this.constructor)) {
            throw new Error('Cannot combine different token classes')
        }
        // Check for duplicate tokens in the array
        const all = tokens.concat([this])
        const countOf = token => all.reduce((count, next) => next === token ? count + 1 : count, 0)
        if (all.some(token => countOf(token) > 1)) throw new Error('Cannot combine duplicate tokens')
        // Destroy each token, absorbing it into this one
        tokens.forEach(token => {
            this.amount += token.amount
            token.destroy()
        })
        // There is no sender for combined tokens
        this.sender = null
        // Make sure our new amount is within safe range
        this._checkAmount(this.amount)
        return this
    }
    _checkAmount (amount) {
        if (typeof amount !== 'number') throw new Error('amount is not a number')
        if (!Number.isInteger(amount)) throw new Error('amount must be an integer')
        if (amount <= 0) throw new Error('amount must be positive')
        if (amount > Number.MAX_SAFE_INTEGER) throw new Error('amount too large')
    }
}

Token2.sealed = false
Token2.decimals = 0
Token2.icon = { emoji: null }
Token2.symbol = null
Token2.supply = 0

Token2.asyncDeps = {
    FyxJig: 'lib/fyx-jig.js'
}

module.exports = Token2;
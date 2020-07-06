
const Sha256 = require(`./sha256`)

class Dice {
    constructor(diceHash) {
        this.random = diceHash;
    }

    roll(count, faces) {
        let value = 0;
        for (let i = 0; i < count; i++) {
            value += (parseInt(this.random.substr(-12), 16) % faces) + 1;
            this.random = Sha256.hashToHex(this.random);
        }
        return value;
    }
}

Dice.asyncDeps = {
    Sha256: 'lib/sha256.js'
}

module.exports = Dice;
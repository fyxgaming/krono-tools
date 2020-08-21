class MockDice {
    constructor(outcomes) {
        this.outcomes = outcomes;
        this.counter = 0;
    }

    roll() {
        return this.outcomes[this.counter++ % this.outcomes.length];
    }
}

module.exports = MockDice;
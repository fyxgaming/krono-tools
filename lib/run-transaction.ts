const { Transaction } = require('bsv-legacy');

export class RunTransaction {
    constructor(private transaction) {}

    get actions() {
        return this.transaction.actions;
    }

    begin() {
        return this.transaction.begin();
    }

    end() {
        return this.transaction.end();
    }

    async commit() {
        let jig = this.transaction.actions[0] && this.transaction.actions[0].target;
        if (!jig) return this.rollback();
        this.end();
        await jig.sync({ forward: false });
    }

    export(): any {
        return this.transaction.export().toString();
    }

    import(rawtx: string): Promise<void> {
        const tx = new Transaction(rawtx);
        return this.transaction.import(tx);
    }

    rollback() {
        return this.transaction.rollback();
    }

    pay() {
        return this.transaction.pay();
    }

    sign() {
        return this.transaction.sign();
    }
}
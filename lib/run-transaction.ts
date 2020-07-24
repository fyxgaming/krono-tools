const { Transaction } = require('bsv-legacy');

export class RunTransaction {
    constructor(run) {
        return new Proxy(run.transaction, {
            get: (target, prop, receiver) => {
                if(prop === 'actions') return target.actions;
                if(prop === 'begin') return target.begin();
                if (prop === 'end') return undefined;
                if (prop === 'commit') return async () => {
                    let jig = target.actions[0] && target.actions[0].target;
                    if (!jig) return target.rollback();
                    target.end();
                    await jig.sync({ forward: false });
                };
                if (prop === 'export') return async () => {
                    return target.export().toString();
                };
                if (prop === 'import') return async (rawtx) => {
                    const tx = new Transaction(rawtx);
                    return target.import(tx);
                };
                if(prop === 'rollback') return target.rollback();
                if(prop === 'pay') return target.pay();
                if(prop === 'sign') return target.sign();
            }
        });
    }
}
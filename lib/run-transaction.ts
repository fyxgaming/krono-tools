import { PaymentRequired } from 'http-errors';

export class RunTransaction {
    constructor(run, blockchain) {
        return new Proxy(run.transaction, {
            get: (target, prop, receiver) => {
                if (prop == 'end') return undefined;
                if (prop === 'commit') return async () => {
                    let jig = target.actions[0] &&
                        target.actions[0].target;
                    if (!jig) return target.rollback();
                    target.end();
                    try {
                        await jig.sync({ forward: false });
                    } catch (e) {
                        console.error(e);
                        if (e.message.includes('Not enough funds')) {
                            throw new PaymentRequired();
                        }
                        throw e;
                    }
                };
                if (prop === 'saveChannel') return async (loc: string, seq?: number) => {
                    const tx = target.export();
                    const input = tx.inputs.find(i => `${i.prevTxId.toString('hex')}_o${i.outputIndex}` === loc);
                    if (!input) throw new Error('Invalid Channel');
                    input.sequenceNumber = seq;
                    tx.sign(run.owner.privkey);
                    await blockchain.saveChannel(loc, tx.toString());
                    target.rollback();
                }
                if (prop === 'signChannel') return async (loc: string, seq?: number) => {
                    const tx = target.export();
                    tx.sign(run.owner.privkey);
                    await blockchain.saveChannel(loc, tx.toString());
                    target.rollback();
                }
                return Reflect.get(target, prop, receiver);
            },
            // TODO evaluate other traps
            getOwnPropertyDescriptor: (target, prop) => {
                if (prop == 'end') return undefined;
                return Reflect.getOwnPropertyDescriptor(target, prop);
            }
        });
    }
}
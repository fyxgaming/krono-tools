const CashierConfig = require('../config/dev/cashier-config');
const Agent = require('../lib/agent');
const Cashout = require('../models/cashout');

class CashierAgent extends Agent {
    async init() {
        this.messageHandlers.set('CashinRequest', this.onCashoutRequest);
        this.messageHandlers.set('CashoutRequest', this.onCashoutRequest);
        this.messageHandlers.set('CashoutPayment', this.onCashoutPayment);
    }

    async onCashinRequest(message) {

    }

    async onCashoutRequest(message) {
        const { paymentAmount, ownerScript } = message.payloadObj;
        const coinIndex = await this.getCoins(ownerScript);
        const coins = [];
        let total = 0;
        for(const c of coinIndex) {
            if(total > paymentAmount) break;
            const coin = await this.wallet.loadJig(c.location);
            coins.push(coin);
            total += coin.amount;
        }
        if(total < paymentAmount) throw new Error('Inadequate Balance');
        const cashout = new Cashout(coins, paymentAmount);
        await cashout.sync();

        const t = this.wallet.createTransaction();
        t.update(() => {
            cashout.execute();
        })
        const rawtx = await t.export({sign: true, pay: true});
        const message = this.wallet.buildMessage({
            reply: message.id,
            payload: JSON.stringify({
                cashoutLoc: cashout.location,
                rawtx
            })
        });
        return message;
    }

    async onCashoutPayment(message) {
        const {cashoutLoc, deviceGPS} = message.payloadObj;
        const cashout = await this.wallet.loadJig(cashoutLoc);
        await cashout.sync();
        if(cashout.paymentAmount !== cashout.coin.paymentAmount ||
            cashout.coin.owner !== this.address    
        ) throw new Error('Invalid Cashout');

        const cashoutMsg = this.wallet.buildMessage({
            payload: JSON.stringify({
                deviceGPS,
                paymentAmount
            })
        });
        return this.blockchain.sendMessage(
            cashoutMsg,
            CashierConfig.cashout
        );
    }
}

CashierAgent.asyncDeps = {
    Agent: 'lib/agent.js',
    Cashout: 'models/cashout.js',
    KronoCoin: 'models/krono-coin.js',
    Payment: 'models/payment.js',
}

module.exports = CashierAgent;

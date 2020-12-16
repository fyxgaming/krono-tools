const Agent = require('../lib/agent');
const CashOut = require('../models/cash-out');

class CashierAgent extends Agent {
    async init() {
        this.messageHandlers.set('CashInRequest', this.onCashInRequest);
        this.messageHandlers.set('CompletePayment', this.onCompletePayment);
        // this.messageHandlers.set('CashOutRequest', this.onCashOutRequest);
        // this.messageHandlers.set('CashOutPayment', this.onCashOutPayment);
    }

    async onCashInRequest(message, ipAddress) {
        const cashInMessage = this.wallet.buildMessage({
            payload: JSON.stringify({
                deviceGPS: message.payloadObj.deviceGPS,
                ipAddress,
                pubkey: message.from,
            })
        });

        const {cashierScript, paymentId, domain, payer} = await this.blockchain.sendMessage(cashInMessage, `${CashierConfig.baseUrl}/payment`)
        let paymentData = await this.storage.hgetall(paymentId);

        if(!paymentData || !paymentData.location) {
            const resp = await this.lib.fetch(`${CashierConfig.baseUrl}/agents/${domain}/coinLock`)
            const {location} = await resp.json();
            paymentData = {
                cashierScript,
                lock: location,
                payer,
                paymentId,
            }
            await this.storage.hmset(paymentId, paymentData);
        }
        console.log('paymentData', paymentData);
        
        return paymentData;
    }

    async onCompletePayment(message) {
        if(message.from !== CashierConfig.paymentPubkey) throw new Error('Invalid sender');
        const { paymentId, amount} = message.payloadObj;
        const {lock, payer} = await this.storage.hgetall(paymentId);

        const Coinlock = await this.wallet.loadJig(lock);
        const coin = await this.sendCoin(new Coinlock(payer), amount);
        await coin.sync();
        console.log('Coin:', coin.location, coin.amount);
    }

    async sendCoin(to, amount) {
        const coins = await this.wallet.loadJigIndex({
            criteria: {
                kind: KronoCoin.origin
            },
            project: {value: false}
        });
        console.log('Coins:', coins.length);
        const coin = await this.pickAndLock(coins, 120);
        if (!coin) throw new Error('no coins');
        coin.send(to, amount);
        return coin;
    }

    async onCashOutRequest(message) {
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
        const cashOut = new CashOut(coins, paymentAmount);
        await cashOut.sync();

        const t = this.wallet.createTransaction();
        t.update(() => {
            cashOut.execute();
        })
        const rawtx = await t.export({sign: true, pay: true});
        return {
            cashOutLoc: cashOut.location,
            rawtx
        };
    }

    async onCashOutPayment(message) {
        const {cashOutLoc, deviceGPS} = message.payloadObj;
        const cashOut = await this.wallet.loadJig(cashOutLoc);
        await cashOut.sync();
        if(cashOut.paymentAmount !== cashOut.coin.paymentAmount ||
            cashOut.coin.owner !== this.address    
        ) throw new Error('Invalid CashOut');

        const cashOutMsg = this.wallet.buildMessage({
            payload: JSON.stringify({
                deviceGPS,
                paymentAmount
            })
        });
        return this.blockchain.sendMessage(
            cashOutMsg,
            CashierConfig.cashOut
        );
    }
}

CashierAgent.sealed = false;
CashierAgent.asyncDeps = {
    Agent: 'lib/agent.js',
    CashOut: 'models/cash-out.js',
    KronoCoin: 'models/krono-coin.js'
}

module.exports = CashierAgent;

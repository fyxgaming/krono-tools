class Agent {
    constructor(wallet, blockchain, handlers, channelHandlers) {
        this.wallet = wallet;
        this.blockchain = blockchain;
        this.address = wallet.address;
        this.pubkey = wallet.pubkey;
        this.purse = wallet.purse;
        this.handlers = handlers;
        this.channelHandlers = channelHandlers;
    }

    initialize() { }

    static hexToBytes(hex) {
        let bytes = new Uint8Array(32);
        for (let i = 0; i < 64; i += 2) {
            bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
        }
        return bytes;
    }

    generateHashchain(size) {
        const hashchain = {};
        // const hashchain = new Array(size);
        let hash = hashchain[size - 1] = this.wallet.randomBytes(32);
        for (let i = size - 2; i >= 0; i--) {
            hash = hashchain[i] = Sha256.hashToHex(Agent.hexToBytes(hash));
        }
        return hashchain
    }
}

Agent.asyncDeps = {
    Sha256: "lib/sha256.js"
}

module.exports = Agent;
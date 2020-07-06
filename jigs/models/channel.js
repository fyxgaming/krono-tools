const KronoJig = require('../lib/krono-jig');

class Channel extends KronoJig {
    init(participants) {
        for (const participant of participants) {
            participant.joinChannel(this);
        }

        this.owner = Config.pubkey;
    }
}

Channel.asyncDeps = {
    Config: 'config/{env}/channel.js',
    KronoJig: 'lib/krono-jig.js'
};
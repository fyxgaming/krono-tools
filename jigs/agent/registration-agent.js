const Agent = require('..//lib/agent');

class RegistrationAgent extends Agent {
    initialize() {

    }

    register() {

    }

}

RegistrationAgent.asyncDeps = {
    Agent: 'lib/agent.chain.json',
}

module.exports = RegistrationAgent;
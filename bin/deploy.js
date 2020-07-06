#!/usr/bin/env node

const dotenv = require('dotenv');
const fs = require('fs-extra');
const minimist = require('minimist');
const path = require('path');
const request = require('request-promise-native');
const { RestBlockchain } = require('kronoverse-server/dist/lib/blockchain/rest-blockchain');
const { Deployer } = require('./dist/deployer');

const Run = require('../run/dist/run.node.min');

var argv = minimist(process.argv.slice(2));

const blockchainUrls = {
    mock: 'http://localhost:8080',
    dev: 'https://kronoverse-dev.appspot.com',
    test: 'https://kronoverse-test.appspot.com',
    prod: 'https://us-central1-kronoverse-backend.cloudfunctions.net'
};


function renderUsage() {
    console.log(`

    #######################################################################################
    USAGE:
        node index deploy --path=/path/to/run_config.json
        node index deploy --network=test --owner=address --purse=address --src=../models/battle.js

    OPTIONS:
        - RUN CONFIG: (DEFAULT: <project-root>/Jigs/.env)
            env                REQUIRED: path to .env file
                -- OR --
            owner               REQUIRED: Address of Jig owner
            env                 OPTIONAL: mock, dev, test, prod (DEFAULT: mock)
            network             OPTIONAL: mock, test, stn, main
            app                 OPTIONAL: run appId

        - SOURCE FILES:
            src                 REQUIRED: One or more Jig src files
                                EXAMPLE: --src={../models/battle.js}

    #######################################################################################

    `);
    return 'Check usage instructions and provide valid parameters';
}

dotenv.config({ path: path.join(process.cwd(), `${argv.env}.env`) });

(async () => {
    const env = argv.env || 'mock';
    const blockchainUrl = argv.blockchain || process.env.BLOCKCHAIN || blockchainUrls[env];
    const owner = argv.owner || process.env.OWNER;
    const purse = argv.purse || process.env.PURSE;
    const network = argv.network || process.env.RUNNETWORK;
    const source = argv.src;
    const disableChainFiles = argv.disableChainFiles;

    const sourcePath = path.resolve(source, 'catalog.js');
    console.log(sourcePath);
    if (!fs.pathExistsSync(sourcePath)) throw new Error(`${source} does not exist`);
    if (!blockchainUrl || !network || !source) {
        renderUsage();
        return;
    }

    const blockchain = new RestBlockchain(blockchainUrl, network);

    const run = new Run({
        blockchain,
        network,
        owner,
        purse,
        app: argv.app
    });
    const rootPath = path.dirname(sourcePath)
    console.log('rootPath:', rootPath);
    const deployer = new Deployer(run, rootPath, env, !disableChainFiles);

    const catalog = await deployer.deploy('catalog.js');

    for (const [agentId, dep] of Object.entries(catalog.agents)) {
        const realm = catalog.realm;
        await request({
            uri: `${blockchainUrl}/agents/${realm}/${agentId}`,
            method: 'PUT',
            body: { loc: dep.location },
            json: true
        });
    }
    console.log('Deployed');
})().catch(e => {
    console.error(e);
    process.exit(1);
});
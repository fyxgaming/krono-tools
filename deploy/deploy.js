#!/usr/bin/env node

const dotenv = require('dotenv');
const fs = require('fs-extra');
const minimist = require('minimist');
const path = require('path');

var argv = minimist(process.argv.slice(2));
console.log('PATH:', process.cwd());
console.log('ARGV:', argv);
dotenv.config({ path: path.join(process.cwd(), `${argv.env}.env`) });
// console.log('ENV:', process.env);

const { LockingPurse } = require('@fyxgaming/lib/dist/locking-purse');
const { RestBlockchain } = require('@fyxgaming/lib/dist/rest-blockchain');
const { Deployer } = require('./deployer');
const { Bip32, KeyPair } = require('bsv');
const Run = require('@fyxgaming/run');

const blockchainUrls = {
    mock: 'http://localhost:8080',
    infra: 'https://kronoverse-infra.appspot.com',
    adhoc: 'https://adhoc.api.cryptofights.io',
    dev: 'https://dev.api.cryptofights.io',
    test: 'https://test.api.fyxgaming.com',
    prod: 'https://api.cryptofights.io',
    prod2: 'https://prod2.aws.kronoverse.io',
    perf: 'https://perf.aws.kronoverse.io'
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

(async () => {
    const env = argv.env || 'mock';
    const blockchainUrl = argv.blockchain || process.env.BLOCKCHAIN || blockchainUrls[env];
    const xpriv = process.env.XPRIV;

    const network = argv.network || process.env.RUNNETWORK;
    const userId = argv.userId || process.env.USER_ID;
    const source = argv.src;
    const catalogFile = argv.catalog || 'catalog.js';
    const disableChainFiles = argv.disableChainFiles;

    const sourcePath = path.resolve(source, catalogFile);
    console.log(sourcePath);
    if (!fs.pathExistsSync(sourcePath)) throw new Error(`${source} does not exist`);
    console.log('CONFIG:', blockchainUrl, network, source);
    if (!blockchainUrl || !network || !source || !xpriv) {
        renderUsage();
        process.exit(1);
    }

    const bip32 = Bip32.fromString(xpriv);
    const owner = bip32.derive('m/1/0').privKey.toString();
    const keyPair = KeyPair.fromPrivKey(bip32.derive('m/1/0').privKey);
    const purseKeyPair = KeyPair.fromPrivKey(bip32.derive('m/0/0').privKey);
    console.log('OWNER:', keyPair.pubKey.toString());
    


    const cache = new Run.plugins.LocalCache();
    const blockchain = new RestBlockchain(
        blockchainUrl, 
        network, 
        cache
    );

    const run = new Run({
        blockchain,
        network,
        owner,
        purse: new LockingPurse(purseKeyPair, blockchain, 100000),
        cache,
        app: argv.app,
        timeout: 120000,
        trust: '*',
        state: new Run.plugins.LocalState(),
    });
    
    console.log('PURSE:', run.purse.address);

    const rootPath = path.dirname(sourcePath);
    console.log('rootPath:', rootPath);
    const deployer = new Deployer(blockchainUrl, userId, keyPair, run, rootPath, env, path.join(process.cwd(), 'node_modules'));

    await deployer.deploy(catalogFile);

    console.log('Deployed');
})().catch(e => {
    console.error(e);
    process.exit(1);
});
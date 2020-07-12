#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const map_storage_1 = require("../lib/storage/map-storage");
const rest_blockchain_1 = require("../lib/blockchain/rest-blockchain");
const deployer_1 = require("../lib/deployer");
const node_fetch_1 = __importDefault(require("node-fetch"));
const dotenv = require('dotenv');
const fs = require('fs-extra');
const minimist = require('minimist');
const path = require('path');
const Run = require('@runonbitcoin/release');
var argv = minimist(process.argv.slice(2));
const blockchainUrls = {
    mock: 'http://localhost:8080',
    dev: 'https://kronoverse-dev.appspot.com',
    test: 'https://kronoverse-test.appspot.com',
    prod: 'https://kronoverse-main.appspot.com'
};
console.log('PATH:', process.cwd());
console.log('ARGV:', argv);
dotenv.config({ path: path.join(process.cwd(), `${argv.env}.env`) });
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
    const owner = argv.owner || process.env.OWNER;
    const purse = argv.purse || process.env.PURSE;
    const network = argv.network || process.env.RUNNETWORK;
    const source = argv.src;
    const disableChainFiles = argv.disableChainFiles;
    const sourcePath = path.resolve(source, 'catalog.js');
    console.log(sourcePath);
    if (!fs.pathExistsSync(sourcePath))
        throw new Error(`${source} does not exist`);
    console.log('CONFIG:', blockchainUrl, network, source);
    if (!blockchainUrl || !network || !source) {
        renderUsage();
        return;
    }
    const blockchain = new rest_blockchain_1.RestBlockchain(blockchainUrl, network, new map_storage_1.MapStorage());
    const run = new Run({
        blockchain,
        network,
        owner,
        purse,
        app: argv.app
    });
    const rootPath = path.dirname(sourcePath);
    console.log('rootPath:', rootPath);
    const deployer = new deployer_1.Deployer(run, rootPath, env, !disableChainFiles);
    const catalog = await deployer.deploy('catalog.js');
    for (const [agentId, dep] of Object.entries(catalog.agents)) {
        const realm = catalog.realm;
        const resp = await node_fetch_1.default(`${blockchainUrl}/agents/${realm}/${agentId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ location: dep.location })
        });
        if (!resp.ok)
            throw new Error(resp.statusText);
    }
    console.log('Deployed');
})().catch(e => {
    console.error(e);
    process.exit(1);
});
//# sourceMappingURL=deploy.js.map
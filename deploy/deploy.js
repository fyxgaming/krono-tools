"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const minimist_1 = __importDefault(require("minimist"));
const path_1 = __importDefault(require("path"));
const rest_blockchain_1 = require("@kronoverse/lib/dist/rest-blockchain");
const deployer_1 = require("./deployer");
const fetch = require('node-fetch');
const Run = require('@kronoverse/run');
var argv = minimist_1.default(process.argv.slice(2));
const blockchainUrls = {
    mock: 'http://localhost:8080',
    adhoc: 'https://adhoc.aws.kronoverse.io',
    dev: 'https://dev.aws.kronoverse.io',
    test: 'https://test.aws.kronoverse.io',
    prod: 'https://main.aws.kronoverse.io'
};
console.log('PATH:', process.cwd());
console.log('ARGV:', argv);
dotenv_1.default.config({ path: path_1.default.join(process.cwd(), `${argv.env}.env`) });
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
    const catalogFile = argv.catalog || 'catalog.js';
    const disableChainFiles = argv.disableChainFiles;
    const sourcePath = path_1.default.resolve(source, catalogFile);
    console.log(sourcePath);
    if (!fs_extra_1.default.pathExistsSync(sourcePath))
        throw new Error(`${source} does not exist`);
    console.log('CONFIG:', blockchainUrl, network, source);
    if (!blockchainUrl || !network || !source) {
        renderUsage();
        process.exit(1);
    }
    const blockchain = new rest_blockchain_1.RestBlockchain(fetch, blockchainUrl, network, new Run.LocalCache());
    const run = new Run({
        blockchain,
        network,
        owner,
        purse,
        app: argv.app,
        timeout: 30000,
        trust: '*'
        // logger: console
    });
    const rootPath = path_1.default.dirname(sourcePath);
    console.log('rootPath:', rootPath);
    const deployer = new deployer_1.Deployer(run, rootPath, env, !disableChainFiles, path_1.default.join(process.cwd(), 'node_modules'));
    const catalog = await deployer.deploy(catalogFile);
    for (const [agentId, dep] of Object.entries(catalog.agents)) {
        const realm = catalog.realm;
        const resp = await fetch(`${blockchainUrl}/agents/${realm}/${agentId}`, {
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
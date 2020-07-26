import dotenv from 'dotenv';
import fs from 'fs-extra';
import minimist from 'minimist';
import path from 'path';

var argv = minimist(process.argv.slice(2));
console.log('PATH:', process.cwd());
console.log('ARGV:', argv);
dotenv.config({ path: path.join(process.cwd(), `${argv.env}.env`) });

import { MapStorage } from '../lib/storage/map-storage';
import { RestBlockchain } from '../lib/rest-blockchain';
import { Deployer } from '../lib/deployer';

import { Bip32, KeyPair } from 'bsv2';
import { SignedMessage } from '../lib/signed-message';


const fetch = require('node-fetch');
const Run = require('@runonbitcoin/release');



const blockchainUrls = {
    mock: 'http://localhost:8080',
    infra: 'https://kronoverse-infra.appspot.com',
    dev: 'https://kronoverse-dev.appspot.com',
    test: 'https://kronoverse-test.appspot.com',
    prod: 'https://kronoverse-main.appspot.com'
};




function renderUsage() {
    console.log(`

    #######################################################################################
    USAGE:

    #######################################################################################

    `);
    return 'Check usage instructions and provide valid parameters';
}

(async () => {
    const env = argv.env || 'mock';
    const blockchainUrl = argv.blockchain || process.env.BLOCKCHAIN || blockchainUrls[env];
    const paymail = argv.paymail || process.env.PAYMAIL;
    const xpriv = argv.xpriv || process.env.XPRIV;
    const network = argv.network || process.env.RUNNETWORK;
    const source = argv.src;
    const catalogFile = argv.catalog || 'catalog.js';
    const disableChainFiles = argv.disableChainFiles;

    const sourcePath = path.resolve(source, catalogFile);
    console.log(sourcePath);
    if (!fs.pathExistsSync(sourcePath)) throw new Error(`${source} does not exist`);
    console.log('CONFIG:', blockchainUrl, network, source);
    if (!blockchainUrl || !network || !source || !xpriv) {
        renderUsage();
        return;
    }

    const bip32 = Bip32.fromString(xpriv);
    const keyPair = KeyPair.fromPrivKey(bip32.privKey);
    const purse = bip32.derive('m/0/0').privKey.toString();
    const owner = bip32.derive('m/1/0').privKey.toString();

    const blockchain = new RestBlockchain(
        blockchainUrl,
        network,
        new MapStorage(),
    );

    const run = new Run({
        blockchain,
        network,
        owner,
        purse,
        app: argv.app,
        logger: console
    });

    const rootPath = path.dirname(sourcePath)
    console.log('rootPath:', rootPath);
    const deployer = new Deployer(run, rootPath, env, !disableChainFiles, path.join(process.cwd(), 'node_modules'));

    const catalog = await deployer.deploy(catalogFile);

    for (const [agentId, { location }] of Object.entries(catalog.agents) as any[]) {
        const message = new SignedMessage({
            from: paymail,
            subject: 'Deployed',
            payload: location
        });
        message.sign(keyPair);
        const resp = await fetch(`${blockchainUrl}/api/accounts/${agentId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(message)
        });
        if (!resp.ok) throw new Error(resp.statusText);
    }
    console.log('Deployed');
})().catch(e => {
    console.error(e);
    process.exit(1);
});
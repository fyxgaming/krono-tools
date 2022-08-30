import { createHash } from 'crypto';
import * as path from 'path';
import * as fs from 'fs-extra';
import simpleGit from 'simple-git/promise';
import axios from '@fyxgaming/lib/dist/fyx-axios';
import { SignedMessage } from '@fyxgaming/lib/dist/signed-message';

const FYX_USER = 'fyx';

export class Deployer {
    cache = new Map<string, any>()
    networkKey: string;
    fs = fs;
    path = path;
    public blockchain;
    private git: simpleGit.SimpleGit;
    public appId: string;
    //private envRegExp: RegExp;

    constructor(
        public apiUrl: string, /* see krono-coin postDeploy */
        public userId: string, /* see krono-coin postDeploy */
        public keyPair: any, /* see krono-coin postDeploy */
        public run: any,
        public rootPath: string,
        public env: string,
        private modulePath: string = path.join(rootPath, 'node_modules'),
        private debug: boolean = true,
        private skipGit: boolean = false
    ) {
        this.git = simpleGit(rootPath.split(path.sep).reduce((s, c, i, a) => c && i < a.length - 1 ? `${s}${path.sep}${c}` : s));
        this.blockchain = run.blockchain;
        this.networkKey = run.blockchain.network;
        this.appId = this.run.app;
    }

    private log(msg: any) {
        if (this.debug) {
            console.log(msg);
        }
    }

    async deploy(source: string, crumbs = 'root', depth = 0): Promise<any> {

        if (this.cache.has(source)) return this.cache.get(source);
        const hash = createHash('sha256');

        depth = (depth || 0);

        let sourcePath = path.isAbsolute(source) ? source : path.join(this.rootPath, source);
        this.log(`SourcePath: ${sourcePath}`);

        crumbs = `${crumbs} > ${source.split(path.sep).pop()}`;
        this.log(crumbs);

        //Load the code from the blockchain
        if (source.endsWith('.chain.json')) {
            this.log(`HAS CHAIN DEPENDENCY`);
            const deployed: any = await this.loadChainFile(source);
            //deployed could be null or undefined
            if (!deployed) throw new Error('Chain dependency could not be found.');
            this.log(`${deployed.name}: ${deployed.location}: ${deployed.hash}`);
            return deployed;
        }

        const resource = require(sourcePath);
        const commitId = this.skipGit ? sourcePath : await this.getLastCommitId(sourcePath);

        //Add the last git commit hash for this file to the hash buffer
        //Git root is the repo this is running in
        hash.update(commitId);

        // run build method
        if (typeof resource.preDeps === 'function') {
            await resource.preDeps(this);
            delete resource.preDeps;
        }

        let deployed = resource;
        const nonDeployedDeps = resource.deps;
        //If there are asyncDeps, recursively load and deploy those as necessary
        const asyncDeps: { [key: string]: string } = resource.asyncDeps || {};
        if (Object.keys(asyncDeps).length) {
            let deps: { [key: string]: any } = {};
            for (let [key, depPath] of Object.entries(asyncDeps)) {
                //Resolve code file path to dependency
                depPath = depPath.replace('{env}', this.env);

                if (depPath.startsWith('.')) {
                    depPath = path.join(path.dirname(source), depPath);
                }
                //Check the cache for dependency
                const dep = await this.deploy(depPath, crumbs, depth + 1);

                //Add to dependency object
                deps[key] = dep;
            }

            //Push dependency hashes into buffer for this resource
            Object.entries(deps).forEach(([key, dep]) => {
                // console.log('DEP:', key, !!dep);
                hash.update((dep as any).hash || '')
            });

            //Apply dependency artifacts to resource deps
            deployed.deps = {
                ...nonDeployedDeps,
                ...deps
            };

            const parent = Object.getPrototypeOf(deployed);
            const dep = deployed.deps[parent.name];
            if (dep && dep !== parent) {
                Object.setPrototypeOf(deployed, dep);
            }
        }

        //Finalize hash for this resource
        deployed.hash = hash.digest('hex');
        delete deployed.asyncDeps;

        //Check to see if this resource needs to be deployed
        let mustDeploy = true;

        //Derive the chain file path
        let chainFilePath = this.deriveChainFilePath(sourcePath);
        let chainArtifact;

        //Is there data for this environment; If not, then must deploy
        let presets;
        try {
            const resp = await axios.get(`${this.apiUrl}/chains/${chainFilePath}`);
            presets = resp.data
        } catch (e: any) {
            // console.error(e);
            if(e.status !== 404) throw e;
        }

        if (presets) {
            let jigLocation = presets.location;
            //Download artifact from chain based on location in chain file
            //If this fails, then either Run is not compatible or the chainfile
            //  is bad and so we will just deploy it again.
            this.log(`RUN.LOAD ${jigLocation} ${chainFilePath}`);
            chainArtifact = await this.run.load(jigLocation).catch((ex) => {
                if (ex.statusCode === 400) {
                    this.log(`Error: ${ex.message}`);
                    this.log(`## Jig could not be loaded from ${jigLocation}`);
                    return { hash: 'DEPLOY_AGAIN' };
                }
                throw (ex);
            });
            //If the hashes match then there is no need to deploy
            if (resource.hash === chainArtifact.hash) {
                //Can use the previously deployed artifact
                mustDeploy = false;
                //We can use the artifact from the chain for this resource
                deployed = chainArtifact;
            }
        }

        if (mustDeploy) {
            try {
                //PreDeploy support for resource to bootstrap anything else it wants
                if (deployed.hasOwnProperty('preDeploy')) {
                    //Allow Jig Class to configure itself with its deps
                    await deployed.preDeploy(this);
                    //Remove preDeploy before putting on chain
                    if (deployed.preDeploy) {
                        delete deployed.preDeploy;
                    }
                }

                let postDeploy;
                if (deployed.hasOwnProperty('postDeploy')) {
                    //Allow Jig Class to configure itself with its deps
                    postDeploy = deployed.postDeploy;
                    //Remove preDeploy before putting on chain
                    delete deployed.postDeploy;
                }
                //Upload the resource to the chain
                this.log(`RUN.DEPLOY ${deployed.name}`);
                if (!deployed.name) {
                    this.log(chainFilePath);
                }
                if (deployed.hasOwnProperty('deploy')) {
                    deployed = await deployed.deploy(this, chainArtifact);
                } else {
                    deployed = this.run.deploy(deployed);
                }
                //Wait for the transaction to be accepted
                this.log(`RUN.SYNC`);
                await this.run.sync();
                if (postDeploy) {
                    deployed = await this.run.load(deployed.location);
                    this.log(`RUN.POST-DEPLOY ${deployed.name}`);
                    await postDeploy.bind(deployed)(this);
                }

                //Put the artifact presets into the chain file
                this.log(`WRITE: ${chainFilePath}`);
                await this.writeChainFile(chainFilePath, deployed);


            } catch (ex) {
                console.error(`ERROR: `, ex);
                throw ex;
            }
        }

        this.cache.set(source, deployed);
        this.log(`READY: ${deployed.name}: ${deployed.location}: ${deployed.hash}`);
        return deployed;
    }

    async getLastCommitId(filePath) {
        if (!fs.existsSync(filePath)) {
            throw new Error(`File path does not exist: \n${filePath}`);
        }
        const status = await this.git.log({
            "file": filePath,
            "max-count": "1",
        })
        if ((status.latest || {}).hash) {
            return status.latest.hash;
        }
        return Promise.reject(new Error('Source file is not under source control.'));
    }

    deriveChainFilePath(sourcePath: string): string {
        const { rootPath, env } = this;
        const chainFilePath = path.parse(sourcePath);
        let relativePath = chainFilePath.dir.replace(rootPath, '');
        relativePath = relativePath.slice(relativePath.indexOf(path.sep) + 1);
        console.log(`relativePath: ${relativePath}`);
        chainFilePath.base = `${chainFilePath.name}.chain.json`;
        return relativePath ?
            `${this.appId}/${relativePath}/${chainFilePath.base}` :
            `${this.appId}/${chainFilePath.base}` // we are returning in a new format e.g. items/armory/common/eyepatch.chain.json
    }

    async loadChainFile(chainFileReference: string): Promise<any> {
        let chainData;
        const { run, cache, env, rootPath, modulePath } = this;

        if (cache.has(chainFileReference)) return cache.get(chainFileReference);
        try {
            const { data } = await axios.get(`${this.apiUrl}/chains/${chainFileReference}`);
            chainData = data;
        } catch (e: any) {
            if(e.status === 404) return;
            throw e;
        }
        //chainData must match current run environment in order to be relevant
        //you can't mix main(net) jigs with test(net) jigs

        if (!chainData) return;

        try {
            const jig = await run.load(chainData.location);
            if (jig) {
                cache.set(chainFileReference, jig);
            }
            return jig;
        } catch (e) {
            console.error('CHAIN LOAD ERROR:', e);
            throw e;
        }
    }

    async writeChainFile(chainFilePath: string, jig: any) {
        if (!jig.origin && !jig.location) {
            throw new Error(`Resource didn't have an origin or location`);
        }
        let { origin, location, nonce, owner, satoshis } = jig;
        let chainData = { id: chainFilePath, origin, location, nonce, owner, satoshis };

        let signedMessage = new SignedMessage({
            subject: `Jigs Deployment`,
            payload: JSON.stringify(chainData)
        }, this.userId, this.keyPair);
        await axios.post(`${this.apiUrl}/chains/${chainFilePath}`, signedMessage);
        this.cache.set(chainFilePath, jig);
    }
}
import { createHash } from 'crypto';
import * as path from 'path';
import { IJig } from "./interfaces";
import * as fs from 'fs-extra';
import simpleGit from 'simple-git/promise';

export class Deployer {
    cache = new Map<string, IJig>()
    networkKey: string;
    fs = fs;
    path = path;
    private git: simpleGit.SimpleGit;
    
    constructor(
        public run: any,
        public rootPath: string,
        public env: string,
        public useChainFiles = false,
        private modulePath = path.join(rootPath, 'node_modules'),
        private debug = true
    ) {
        this.git = simpleGit(rootPath.split(path.sep).reduce((s, c, i, a) => c && i < a.length - 1 ? `${s}${path.sep}${c}` : s));
    }

    private log(msg: any) {
        if (this.debug) {
            console.log(msg);
        }
    }

    async deploy(source: string, crumbs = 'root', depth = 0): Promise<any> {
        if (this.cache.has(source)) return this.cache.get(source);
        const hash = createHash('sha256');

        // console.log(sourcePath);
        depth = (depth || 0);

        let sourcePath = path.isAbsolute(source) ? source : path.join(this.rootPath, source);
        this.log(source);

        crumbs = `${crumbs} > ${source.split(path.sep).pop()}`;
        this.log(crumbs);

        //Load the code file
        let chainData = {};
        if (source.endsWith('.chain.json')) {
            return this.loadChain(source);
        }

        // if (!await fs.pathExists(sourcePath)) {
        //     const dep = require(source);
        //     if (!dep[`location${this.networkKey}`]) throw new Error(`${source} not deployed`);
        //     const deployed = this.run.load(dep[`location${this.networkKey}`]);
        //     this.cache.set(source, deployed);
        //     return deployed;
        // }

        const resource = require(sourcePath);
        const commitId = this.useChainFiles ?
            await this.getLastCommitId(sourcePath) :
            sourcePath;


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
            let deps: { [key: string]: IJig } = {};
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
                // parent.presets = {
                //     [this.run.blockchain.network]: {
                //         location: dep.location,
                //         origin: dep.location,
                //         owner: dep.owner,
                //         satoshis: dep.satoshis,
                //         nonce: dep.nonce
                //     }
                // };
                // parent.presets[this.run.network] = dep.presets[this.run.network];
                // parent[`location${this.networkKey}`] = dep.location;
            }
        }

        //Finalize hash for this resource
        deployed.hash = hash.digest('hex');
        delete deployed.asyncDeps;

        //Check to see if this resource needs to be deployed
        let mustDeploy = true;

        //Derive the chain file path
        let chainFilePath = this.deriveChainFilePath(sourcePath);

        //Does the chain file exist; If not, then must deploy
        if (this.useChainFiles && fs.existsSync(chainFilePath)) {
            //Is there data for this network; If not, then must deploy
            chainData = require(chainFilePath);

            if (chainData[this.env]) {
                let jigLocation = chainData[this.env];
                //Download artifact from chain based on location in chain file
                //If this fails, then either Run is not compatible or the chainfile
                //  is bad and so we will just deploy it again.
                this.log(`RUN.LOAD ${jigLocation}`);
                let chainArtifact = await this.run.load(jigLocation).catch((ex) => {
                    // if (ex.statusCode === 404) {
                    this.log(`Error: ${ex.message}`);
                    this.log(`## Jig could not be loaded from ${jigLocation}`);
                    return { hash: 'DEPLOY_AGAIN' };
                    // }
                    // throw (ex);
                });
                //If the hashes match then there is no need to deploy
                if (resource.hash === chainArtifact.hash) {
                    //Can use the previously deployed artifact
                    mustDeploy = false;
                    //We can use the artifact from the chain for this resource
                    deployed = chainArtifact;
                }
            }
        }

        if (mustDeploy) {
            try {
                //PreDeploy support for resource to bootstrap anything else it wants
                if (typeof deployed.preDeploy === 'function') {
                    //Allow Jig Class to configure itself with its deps
                    await deployed.preDeploy(this);
                    //Remove preDeploy before putting on chain
                    if (deployed.preDeploy) {
                        delete deployed.preDeploy;
                    }
                }

                let postDeploy;
                if (typeof deployed.postDeploy === 'function') {
                    //Allow Jig Class to configure itself with its deps
                    postDeploy = deployed.postDeploy.bind(deployed);
                    //Remove preDeploy before putting on chain
                    delete deployed.postDeploy;

                }
                //Upload the resource to the chain
                this.log(`RUN.DEPLOY ${deployed.name}`);
                if (!deployed.name) {
                    this.log(chainFilePath);
                }
                deployed = this.run.deploy(deployed);
                //Wait for the transaction to be accepted
                this.log(`RUN.SYNC`);
                await this.run.sync();
                if (postDeploy) {
                    await postDeploy(this);
                }

                //Put the artifact location into the chain file
                if (deployed.origin || deployed.location) {
                    chainData[this.env] = (deployed.origin || deployed.location);
                }
                else {
                    throw new Error('Chain resource didn\'t have an origin or location after upload');
                }
            } catch (ex) {
                console.error(ex);
                throw ex;
            }

            //Write out the chain file
            if (this.useChainFiles) {
                await fs.writeFile(chainFilePath, JSON.stringify(chainData, null, 4));
            }
        }

        this.cache.set(source, deployed);
        this.log(`${deployed.name}: ${deployed.location}: ${deployed.hash}`);
        return deployed;
    }

    deriveChainFilePath(sourcePath) {
        let chainFilePath = path.parse(sourcePath);
        chainFilePath.base = `${chainFilePath.name}.chain.json`;
        return path.format(chainFilePath);
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

    async loadChain(chainFile: string): Promise<IJig | undefined> {
        if (this.cache.has(chainFile)) return this.cache.get(chainFile);
        let sourcePath;
        if (fs.pathExistsSync(path.join(this.rootPath, chainFile))) {
            sourcePath = path.join(this.rootPath, chainFile);
        } else {
            sourcePath = path.join(this.modulePath, chainFile)
        }
        if (!fs.pathExistsSync(sourcePath)) return;
        const chainData = fs.readJSONSync(sourcePath);
        if (!chainData[this.env]) return;
        const jig = await this.run.load(chainData[this.env]).catch((ex) => {
            // if (ex.statusCode === 404) return;
            // throw (ex);
        });
        if (jig) {
            this.cache.set(chainFile, jig);
        }
        return jig;
    }

    async writeChain(chainFile: string, jig: IJig) {
        const chainPath = path.join(this.rootPath, chainFile);
        const chainData = fs.pathExistsSync(chainPath) ? fs.readJSONSync(chainPath) : {}
        chainData[this.env] = jig.location;
        this.cache.set(chainFile, jig);
        await fs.outputFile(chainPath, JSON.stringify(chainData, null, 4));
    }

    // async loadConfig(chainFile, typeFile, ...params): Promise<IJig> {
    //     let config;
    //     try {
    //         config = await this.loadChain(path.join(this.rootPath, chainFile));
    //     } catch (e) {
    //         console.error('ERROR loading jig', e.message);
    //     }

    //     if (!config) {
    //         const Type = await this.deploy(typeFile);
    //         await Type.sync();
    //         config = new Type(...params);
    //         await config.sync();
    //         await this.writeChain(chainFile, config);
    //     }

    //     return config;
    // }
}
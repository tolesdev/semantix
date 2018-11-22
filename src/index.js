#!/usr/bin/env node
const yargs = require('yargs');
const path = require('path');
const fs = require('fs');
const Logger = require('./utils/logger');
// const process = require('process');
const createRelease = require('../src/create.release');
const Configuration = require('./providers/config.provider');
const Git = require('./providers/git.provider');
const Verify = require('./utils/verify');
const Version = require('./providers/version.provider');
const packagePath = path.resolve(process.cwd(), 'package.json');

const verifyGeneral = async verify => {
    await verify.nodeVersion();
    await verify.gitVersion();
    await verify.gitRepoExists();
    await verify.repositoryHasCommits();
};
const log = new Logger();

const run = async () => {    
    yargs
        .scriptName('semantix')
        .command(['current', 'latest'],'Generate the latest version', {}, async args => {
            const config = new Configuration(args);
            const verify = new Verify(config);
            const version = new Version(config);
            const git = new Git(config);
            const opts = {
                remote: await git.remote(),
                tags: await git.tags()
            };
            try {
                await verifyGeneral(verify);
                console.log((await version.current(opts)).version);
            }
            catch(error) {
                log.billboardError(error);
                process.exit(1);
            }
        })
        .command('next','Generate the next version', {}, async args => {
            const config = new Configuration(args);
            const verify = new Verify(config);
            const version = new Version(config);
            const git = new Git(config);
            const opts = {
                remote: await git.remote(),
                tags: await git.tags(),
                commits: await git.commits(),
                mapping: config.mapping()
            };
            try {
                await verifyGeneral(verify);
                console.log(await version.next(opts));
            }
            catch(error) {                        
                log.billboardError(error);
                process.exit(1);
            }
        })
        .command('release', 'Create a release', {}, async args => {
            const config = new Configuration(args);
            const verify = new Verify(config);
            const version = new Version(config);
            const git = new Git(config);
            const branchName = config.branch();
            const gitProvider = config.gitProvider();
            const owner = await git.owner();
            const repositoryName = await git.repositoryName();
            const verifyBranch = {
                branchName,
                headSHA: await git.headSha(),
                branchHeadSHA: await git.localSha(branchName)
            };
            const versionOpts = {
                remote: await git.remote(),
                tags: await git.tags(),
                commits: await git.commits(),
                mapping: config.mapping()
            };
            const nextVersion = await version.next(versionOpts);
            const current = await version.current(versionOpts);
            const createReleaseOpts = {
                config,
                gitProvider,
                nextVersion,
                current,
                owner,
                repositoryName,
                ...verifyBranch,
                ...versionOpts
            };
            try {
                await verifyGeneral(verify);
                await verify.releaseBranch(verifyBranch);
                await verify.newReleaseVersion(current.version, nextVersion);
                await verify.accessToken();
                await verify.apiBaseUrl();

                await createRelease(createReleaseOpts);
            }
            catch (error) {
                log.billboardError(error);
                process.exit(1);
            }
        })
        .command('update', 'Update package.json with the next version', {}, async args => {
            const config = new Configuration(args);
            const version = new Version(config);
            const git = new Git(config);
            const opts = {
                remote: await git.remote(),
                tags: await git.tags(),
                commits: await git.commits(),
                mapping: config.mapping()
            };
            let consumerPkg = null;
            try {
                consumerPkg = require(packagePath);
            }
            catch (e) {
                log.billboardError("Unable to locate package.json in the current directory.");
                process.exit(1);
            }
            try {
                const nextVersion = await version.next(opts);
                consumerPkg.version = nextVersion;
                fs.writeFileSync(packagePath, JSON.stringify(consumerPkg, null, 4));
                console.log(`🚀  Successfully updated package to version ${nextVersion}`);
            }
            catch (error) {
                log.billboardError(error);
                process.exit(1);
            }
        })
        .option('branch', {
            desc: 'The release branch',
            type: 'string'
        })
        .option('v', {
            alias: 'verbose',
            desc: 'Flag enabling verbose logging',
            default: false,
            type: 'boolean'
        })
        .help()
        .argv;
};

run();
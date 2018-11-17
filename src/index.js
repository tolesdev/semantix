#!/usr/bin/env node
const yargs = require('yargs');
const path = require('path');
const fs = require('fs');
const log = require('./utils/logger');
const createRelease = require('../src/create.release');
const verifyRequirements = require('../src/verify.requirements');
const Configuration = require('./providers/config.provider');
const Version = require('./providers/version.provider');
const verifyRelease = require('../src/verify.release');
const verifyCommits = require('./verify.commits');
const packagePath = path.resolve(process.cwd(), 'package.json');

const run = async () => {
    try {
        if (await verifyRequirements() && await verifyCommits()) {            
            yargs
                .scriptName('semantix')
                .command(['current', 'latest'],'Generate the latest version', {}, async () => {
                    console.log((await Version.current()).version);                    
                })
                .command('next','Generate the next version', {}, async args => {
                    const config = new Configuration(args);
                    console.log(await Version.next(config.mapping()));
                })
                .command('release', 'Create a release', {}, async args => {
                    const config = new Configuration(args);
                    try {
                        if (await verifyRelease(config.branch())) {
                            await createRelease(config.branch(), config.mapping());
                        }
                    }
                    catch (error) {
                        log.billboardError(error.message);
                    }
                })
                .command('update', 'Update package.json with the next version', {}, async args => {
                    let consumerPkg = null;
                    try {
                        consumerPkg = require(packagePath);
                    }
                    catch (e) {
                        log.billboardError("Unable to locate package.json in the current directory.");
                    }
                    const config = new Configuration(args);
                    const nextVersion = await Version.next(config.mapping());
                    consumerPkg.version = nextVersion;
                    fs.writeFileSync(packagePath, JSON.stringify(consumerPkg, null, 4));
                    console.log(`🚀  Successfully update package to version ${nextVersion}`);
                })
                .option('branch', {
                    type: 'string'
                })
                .help()
                .argv;
        }
    }
    catch (error) {
        log.billboardError(error.message);
    }
};

run();
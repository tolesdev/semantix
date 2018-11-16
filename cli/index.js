#!/usr/bin/env node

const yaml = require('js-yaml');
const yargs = require('yargs');
const path = require('path');
const fs = require('fs');
const log = require('../classes/Logger');
const getVersion = require('../src/get-version');
const createRelease = require('../src/create-release');
const verifyRequirements = require('../src/verify-requirements');
const verifyRelease = require('../src/verify-release');
const packagePath = path.resolve(process.cwd(), 'package.json');
const consumerPkg = require(packagePath);
const { DEFAULTS } = require('../constants');
let config = null;

try {
    const configPath = path.resolve(process.cwd(), 'semantix.yml');
    if (fs.existsSync(configPath)) {
        config = yaml.safeLoad(fs.readFileSync(configPath), 'utf8');
    }
}
catch (e) {
     log.billboardWarning('There was an error loading your configuration, using defaults.')
}

const run = async () => {
    try {
        if (await verifyRequirements()) {
            const release = config && config.release || DEFAULTS.RELEASE;
            const version = await getVersion(release);
            
            yargs
                .scriptName('semantix')
                .command(['latest', 'current'],'Generate the latest version', {}, async () => {
                    console.log(version.latest);                    
                })
                .command('next','Generate the next version', {}, async args => {
                    console.log(version.next);
                })
                .command('release', 'Create a release', {}, async args => {
                    try {
                        if (await verifyRelease(args.branch)) {
                            await createRelease(version.next);
                        }
                    }
                    catch (error) {
                        log.billboardError(error.message);
                    }
                })
                .command('update', 'Update package.json with the next version', {}, async args => {
                    consumerPkg.version = version.next;
                    fs.writeFileSync(packagePath, JSON.stringify(consumerPkg, null, 4));
                    console.log(`🚀  Successfully update package to version ${version.next}`);
                })
                .option('branch', {
                    default: config && config.branch,
                    describe: 'The release branch',
                    type: 'string'
                })
                .help()
                .argv;
        }
    }
    catch (error) {
        log.billboardError(error.message);
    };
};

run();
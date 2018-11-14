#!/usr/bin/env node

const getVersion = require('../get-version');
const createRelease = require('../create-release');
const verifyRequirements = require('../verify-requirements');
const verifyRelease = require('../verify-release');
const log = require('../classes/Logger');
const yaml = require('js-yaml');
const yargs = require('yargs');
const path = require('path');
const fs = require('fs');
const packagePath = path.resolve(process.cwd(), 'package.json');
const consumerPkg = require(packagePath);
const { MAJOR, MINOR, PATCH } = require('../constants');
let config = null;

try {
    config = yaml.safeLoad(fs.readFileSync(path.resolve(process.cwd(), 'semantix.yml')), 'utf8');
}
catch (e) {
     log.billboardWarning('There was an error loading your configuration, using defaults.')
}

const release = config && config.release || {
    'BREAKING': MAJOR,
    'feat': MINOR,
    'perf': MINOR,
    'init': PATCH,
    'chore': PATCH,
    'fix': PATCH,
    'test': PATCH,
    'docs': PATCH
};

yargs
    .command(['latest', 'current'],'Generate the latest version', {}, async () => {
        try {
            if (await verifyRequirements()) {
                console.log((await getVersion(release)).latest);
            }
        }
        catch (error) {
            log.billboardError(error.message);
        };
    })
    .command('next','Generate the next version', {}, async () => {
        try {
            if (await verifyRequirements()) {
                console.log((await getVersion(release)).next);
            }
        }
        catch (error) {
            log.billboardError(error.message);
        };
    })
    .command('release', 'Create a release', {}, async args => {
        try {
            // console.log(await verifyRelease(args.b || args.branch));
            if (await verifyRequirements() && await verifyRelease(args.branch || args.b)) {
                await createRelease((await getVersion(release)).next);
            }
        }
        catch (error) {
            log.billboardError(error.message);
        }
    })
    .command('update', 'Update package.json with the next version', {}, async () => {
        try {
            if (await verifyRequirements()) {
                const nextVersion = (await getVersion(release)).next;
                consumerPkg.version = nextVersion;
                fs.writeFileSync(packagePath, JSON.stringify(consumerPkg, null, 4));
                console.log(`🚀  Successfully update package to version ${nextVersion}`)
            }
        }
        catch (error) {
            log.billboardError(error.message);
        }
    })
    .option('branch', {
        alias: 'b',
        default: config && config.branch,
        describe: 'The release branch',
        type: 'string'
    })
    .option('repository', {
        alias: 'r',
        default: config && config.repository,
        describe: 'Git repository URL',
        type: 'string'
    })
    // .option('no-ci', {
    //     default: false,
    //     describe: 'Do not run in CI environment',
    //     type: 'string'
    // })
    .help()
    .argv;
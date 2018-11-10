#!/usr/bin/env node

const getVersion = require('../get-version');
const createRelease = require('../create-release');
const verifyRequirements = require('../verify-requirements');
const verifyRelease = require('../verify-release');
const yargs = require('yargs');
const pkg = require('../package.json');
const log = require('../classes/Logger');

yargs
    .command('current','Generate the current version', {}, async () => {
        try {
            if (await verifyRequirements()) {
                console.log((await getVersion()).current);
            }
        }
        catch (error) {
            log.billboardError(error.message);
        };
    })
    .command('next','Generate the next version', {}, async () => {
        try {
            if (await verifyRequirements()) {
                console.log((await getVersion()).next);
            }
        }
        catch (error) {
            log.billboardError(error.message);
        };
    })
    .command('release', 'Create a release', {}, async args => {
        try {
            if (await verifyRequirements() && await verifyRelease(args.b || args.branch)) {
                await createRelease(await getVersion().next);
            }
        }
        catch (e) {
            log.error(error.message);
        }
    })
    .option('branch', {
        alias: 'b',
        default: 'master',
        describe: 'The release branch',
        type: 'string'
    })
    .option('repository', {
        alias: 'r',
        describe: 'Git repository URL',
        type: 'string'
    })
    .help()
    .argv;
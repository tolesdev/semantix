#!/usr/bin/env node

const getVersion = require('../get-version');
const getCurrentBranch = require('../get-branch');
const createRelease = require('../create-release');
const verifyRequirements = require('../verify-requirements');
const yargs = require('yargs');
const pkg = require('../package.json');
const log = require('../classes/Logger');

const verify = async () => {    
    try {
        await verifyRequirements();
    }
    catch (error) {
        log.billboardError(error.message);
    };
}

yargs
    .command('current','Generate the current version', {}, async () => {
        await verify();
        const version = await getVersion();
        console.log(version.current);
    })
    .command('next','Generate the next version', {}, async () => {
        await verify();
        const version = await getVersion();
        console.log(version.next);
    })
    .command('release', 'Create a release on your release branch', {}, async args => {
        await verify();        
        try {
            const releaseBranch = args.b || args.branch,
                  currentBranch = await getCurrentBranch();
            if (currentBranch === releaseBranch) {
                await createRelease(args, pkg);
            }
        }
        catch (error) {
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
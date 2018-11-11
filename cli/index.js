#!/usr/bin/env node

const getVersion = require('../get-version');
const createRelease = require('../create-release');
const verifyRequirements = require('../verify-requirements');
const verifyRelease = require('../verify-release');
const log = require('../classes/Logger');
const yargs = require('yargs');
const path = require('path');
const fs = require('fs');
const packagePath = path.resolve(process.cwd(), 'package.json');
const consumerPkg = require(packagePath);

yargs
    .command(['latest', 'current'],'Generate the latest version', {}, async () => {
        try {
            if (await verifyRequirements()) {
                console.log((await getVersion()).latest);
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
            // console.log(await verifyRelease(args.b || args.branch));
            if (await verifyRequirements() && await verifyRelease(args.b || args.branch)) {
                await createRelease((await getVersion()).next);
            }
        }
        catch (error) {
            log.billboardError(error.message);
        }
    })
    .command('update', 'Update package.json with the next version', {}, async () => {
        try {
            if (await verifyRequirements()) {
                const nextVersion = (await getVersion()).next;
                consumerPkg.version = nextVersion;
                fs.writeFileSync(packagePath, JSON.stringify(consumerPkg, null, 2));
                console.log(`🚀 Successfully update package to version ${nextVersion}`)
            }
        }
        catch (error) {
            log.billboardError(error.message);
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
    // .option('no-ci', {
    //     default: false,
    //     describe: 'Do not run in CI environment',
    //     type: 'string'
    // })
    .help()
    .argv;
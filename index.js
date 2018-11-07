#!/usr/bin/env node

// const chalk = require('chalk');
// const { command, argv } = require('yargs');
// const Repository = require('./classes/Repository');
const execa = require('execa');
const findVersions = require('find-versions');
execa
    .stdout('git', ['--version'])
    .then(stdout => {
        const versions = findVersions(stdout);
        console.log(versions);
    });
// console.log(`${chalk.green('✔')} It worked!`);
// const repo = new Repository();
// console.log(`${chalk.bgRed.white('Getting Remotes 👀  ')}`);
// repo.test();
// console.log(`Cloning repository: ${chalk.bold.green()}`);
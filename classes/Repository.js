const git = require('simple-git')
const hash = require('random-hash');
const chalk = require('chalk');
const { isDevelopment } = require('../environment');

const consoleHandler = (test) => {
    if (isDevelopment) {
        console.log.bind(console);
        console.log('test', test);
    }
}

class Repository {
    constructor () {
        this.git = git();
        this.repositoryRegex = new RegExp('((git|ssh|http(s)?)|(git@[\w\.]+))(:(\/\/)?)([\w\.@\:\/\-~]+)(\.git)(\/)?');
    }
    test() {
        // this.git.getRemotes(true, consoleHandler);
        // this.addTag('test-tag');
        this.addTag('@#$@^&', consoleHandler);
    }
    clone(repositoryUrl) {
        if (!repositoryUrl.test(this.repositoryRegex))
            throw new Error('Must provide a valid git repository url.');
        this.git.clone(repositoryUrl, `../repos/${hash()}`);
    }
    addTag(tagName) {
        try {
            this.git.addTag(tagName);
        }
        catch (e) {
            console.log(`${chalk.red('Error tagging branch: ')}\n${e}`);
        }
    }
}

module.exports = Repository;
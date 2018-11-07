const execa = require('execa');
const getVersion = require('../get-version');
const findVersions = require('find-versions');
const semver = require('semver');
const pkg = require('../package.json');
const log = require('../classes/Logger');

(async () => {    
    // execa
    // .stdout('git', ['--version'])
    // .then(stdout => {
    //     const versions = findVersions(stdout);
    // })
    // .catch(err => {
    //     log.error(err);
    // });

    console.log('version: ', await getVersion());

    if (!semver.satisfies(process.version, pkg.engines.node)) {
        log.billboardError(`Node version out of date, expected >=6.0.0 but found ${process.version}.`);
    }
})();
const execa = require('execa');
const findVersions = require('find-versions');
const semver = require('semver');
const pkg = require('../package.json');
const log = require('../classes/Logger');

execa
    .stdout('git', ['--version'])
    .then(stdout => {
        const versions = findVersions(stdout);
    })
    .catch(err => {
        log.error(err);
    });

execa
    .stdout('git', ['log', '--oneline', '--first-parent master', '--no-merges'])
    .then(stdout => {
        console.log(stdout);
    })
    .catch(err => {
        log.error(err);
    });

if (!semver.satisfies(process.version, pkg.engines.node)) {
    log.billboardError(`Node version out of date, expected >=6.0.0 but found ${process.version}.`);
}
const execa = require('execa');
const findVersions = require('find-versions');
const semver = require('semver');
const pkg = require('../package.json');
const log = require('../classes/Logger');

const commitHashLength = 4;

execa
    .stdout('git', ['--version'])
    .then(stdout => {
        const versions = findVersions(stdout);
    })
    .catch(err => {
        log.error(err);
    });

execa
    .stdout('git', [
        'log',
        '--pretty=oneline',
        '--abbrev-commit',
        `--abbrev=${commitHashLength}`,
        '--first-parent',
        '--no-merges'
    ])
    .then(stdout => {
        let output = stdout.split('/n');
        console.log(output);
    })
    .catch(err => {
        log.error(err);
    });

if (!semver.satisfies(process.version, pkg.engines.node)) {
    log.billboardError(`Node version out of date, expected >=6.0.0 but found ${process.version}.`);
}
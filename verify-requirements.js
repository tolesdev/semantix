const execa = require('execa');
const semver = require('semver');
const findVersions = require('find-versions');
const pkg = require('./package.json');

module.exports = async () => {
    // Verify Git Version
    const gitVersionOutput = await execa.stdout('git', [ '--version' ]);
    const version = findVersions(gitVersionOutput)[0];
    if (semver.valid(requirements.gitVersion) < semver.valid(version)) {
        throw new Error(`Git version ${requirements.gitVersion} required, but version ${version} was found.`);
    }
    
    // Verify Git Repository Exists
    const gitRepoExistsOutput = await execa.stdout('git', [ 'show-ref' ]);
    if (gitRepoExistsOutput.includes('Not a git repository')) {
        throw new Error(`No git repository found.`);
    }
    
    // Verify Node Version
    if (!semver.satisfies(process.version, pkg.engines.node)) {
        throw new Error(`Node version out of date, expected ${pkg.engines.node} but found ${process.version}.`);
    }
}; 

const requirements = {
    gitVersion: '2.6.5',
    nodeVersion: '7.6.0'
};
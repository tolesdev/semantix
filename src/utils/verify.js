const execa = require('execa');
const semver = require('semver');
const findVersions = require('find-versions');
const pkg = require('../../package.json');
const dotenvExpand = require('dotenv-expand');
dotenvExpand(require('dotenv').config());
const Logger = require('./logger');

/** Verifys program constraints. */
class Verify {
    /** Create a Verify object. */
    constructor(configuration) {
        this.config = configuration;
        this.log = new Logger(this.config.verbose());
        this.GITHUB_TOKEN = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
        this.GITLAB_TOKEN = process.env.GL_TOKEN || process.env.GITLAB_TOKEN;
        this.GITHUB_URL = process.env.GL_URL || process.env.GITHUB_URL;
        this.GITLAB_URL = process.env.GL_URL || process.env.GITLAB_URL;
        this.versionRequirements = {
            gitVersion: '2.6.5'
        };
    }
    /** Verifies the presence of an access token from one and no more or less than one git provider. */
    accessToken() {
        if (this.GITLAB_TOKEN && this.GITHUB_TOKEN) {        
            throw new Error('Found both GITLAB_TOKEN and GITHUB_TOKEN, please supply one or the other.');
        }
        if (!this.GITLAB_TOKEN && !this.GITHUB_TOKEN) {        
            throw new Error('Either GITLAB_TOKEN or GITHUB_TOKEN must be provided to create a release.');
        }
        this.log.debug('Verify', 'Successfully loaded access token.');
        return true;
    }
    /** Verifies that a git providers API Base Url has been defined. */
    apiBaseUrl() {
        if (!this.GITLAB_URL && !this.GITHUB_URL) {        
            throw new Error(`${this.GITLAB_TOKEN ? `GITHUB_URL` : `GITHUB_URL`} variable is missing`);
        }
        this.log.debug('Verify', `API Base URL: ${this.GITHUB_URL || this.GITLAB_URL}`);
        return true;
    }
    /** Verifies that the next generated version is greater than the latest version. */
    newReleaseVersion(currentVersion, nextVersion) {
        if (!semver.gt(nextVersion, currentVersion)) {
            throw new Error(`Release has already been created for version ${nextVersion}`);
        }
        this.log.debug('Verify', `Current version: ${currentVersion}`);
        this.log.debug('Verify', `Next version: ${nextVersion}`);
        return true;
    }
    /** Verifies we are operating on the release branch. */
    async releaseBranch({branchName, headSHA, branchHeadSHA}) {
        if (headSHA !== branchHeadSHA) {
            throw new Error(`HEAD is not pointed at the HEAD of ${branchName}`);
        }
        this.log.debug('Verify', `Release branch: ${branchName}`);
        return true;
    }
    /** Verifies a compatible version of Git is installed. */
    async gitVersion() {
        const gitVersionOutput = await execa.stdout('git', [ '--version' ]);
        const version = findVersions(gitVersionOutput)[0];
        if (semver.valid(this.versionRequirements.gitVersion) < semver.valid(version)) {
            throw new Error(`Git version ${this.versionRequirements.gitVersion} required, but version ${version} was found.`);
        }
        this.log.debug('Verify', `Git version: ${version}`);
        return true;
    }
    /** Verifies we're operating in a Git repository. */
    async gitRepoExists() {
        const gitRepoExistsOutput = await execa.stdout('git', [ 'rev-parse', '--git-dir' ]);
        if (gitRepoExistsOutput.includes('Not a git repository')) {
            throw new Error(`No git repository found.`);
        }
        return true;
    }
    /** Verifies we're running on a sufficient node version. */
    async nodeVersion() {
        if (!semver.satisfies(process.version, pkg.engines.node)) {
            throw new Error(`Node version mismatch, expected ${pkg.engines.node} but found ${process.version}.`);
        }
        this.log.debug('Verify', `Node version: ${semver.valid(process.version)}`);
        return true;
    }
    /** Verifies that the repository has commits to analyze. */
    async repositoryHasCommits() {            
        try {
            await execa.stdout('git', ['log']);
        }
        catch (e) {
            throw new Error('No commits found.');
        }
        return true;
    }
}

module.exports = Verify;
const execa = require('execa');
const Logger = require('../utils/logger');
/**
 * Provides git repository information by executing git commands.
 * @class
 */
class GitProvider {
    constructor(configuration) {
        this.config = configuration;
        this.log = new Logger(this.config.verbose());
    }
    /**
     * Get name and commit sha from the current branch.
     * @async
     * @throws Throws if unable to retrieve current branch info
     * @returns {object} branch - { name, sha }
     */
    async branch() {
        try {            
            const name = await execa.stdout('git', [ 'rev-parse', '--abbrev-ref', 'HEAD' ]);
            const sha = await execa.stdout('git', [ 'rev-parse', 'HEAD' ]);
            this.logs.debug('GitProvider', `Current branch: ${name}`);
            return { name, sha };            
        }
        catch (e) {
            throw new Error(`Something went wrong when trying to get branch information.\n${e.message}`);
        }
    }

    /**
     * Gets the configured remote repository.
     * @async
     * @returns {string} remote - Repository URL, with token injected if found
     */
    async remote() {
        const accessToken = this.config.accessToken();
        const origin = await this.remote_raw();
        if (!origin) return null;
        if (/^git@.+/.test(origin)) {
            throw new Error("Semantix currently only supports the use of HTTP/HTTPS")
        }
        // No tokens were present, assume the repository is public and return remote
        if (!accessToken) {
            return origin;
        }
        // If the remote has a token we need to swap it out with the provided token
        if (/.+:.+@/.test(origin)) {
            return origin.replace(/^(https?:\/\/[^:]+):.+@(.+)/, `$1:${accessToken}@$2`)
        }
        // If there is no token present we add the provided token
        return origin.replace(/^(https?:\/\/)(.+)/, `$1oauth2:${accessToken}@$2`);
    }

    /**
     * Gets the configured remote repository.
     * @async
     * @returns {string} remote_raw - Repository URL
     */
    async remote_raw() {
        try {
            return await execa.stdout('git', [ 'config', '--get', 'remote.origin.url' ]);
        }
        catch (e) {
            // There is no remote repository
            return null;
        }
    }

    /**
     * Gets a list of tag references for the current repository.
     * @async
     * @throws Throws if unable to retrieve tags
     * @returns {string} A string of newline delimited tag references
     */
    async tags() {
        const remote = await this.remote();
        /**
         * We want to allow the option to generate a latest version for local git repositories.
         * In the case of no version tags, start from version zero.
         */
        try {
            if (!remote) {
                return await execa.stdout('git', [ 'tag' ]);
            }
            return await execa.stdout('git', [ 'ls-remote', '--quiet', '--tags', remote ]);
        }
        catch (e) {
            throw new Error(`There was an error trying to retrieve git tags${remote ? ` from ${await this.remote_raw()}` : ''}`);
        }
    }

    /**
     * Get the commit log for the current repository.
     * @async
     * @throws Throws is unable to retrieve git logs
     * @returns {string} log - A string of newline delimited commit messages
     */
    async logs() {
        try {
            return await execa.stdout('git', [ 'log', '--pretty=oneline', '--first-parent', '--no-merges', '--reverse' ]);
        }
        catch (e) {
            throw new Error('There was a problem trying to retrieve the commit logs');
        }
    }

    /**
     * Gets a list of commits.
     * @async
     * @returns {string[]} commits - A list of commits, sha and message
     */
    async commits() {
        const log = await this.logs();
        return log.split('\n');
    }

    /**
     * Gets the owner name from the remote repository.
     * @async
     * @returns {string} owner - Name of the repository owner
     */
    async owner() {
        // TODO: Extract Regex to shared variable with repositoryName()
        return (await this.remote()).match(/\/(\w+)\/([\w-]+).git$/)[1];
    }

    /**
     * Gets the name of the repository.
     * @async
     * @returns {string} repoistoryName - Name of the repository
     */
    async repositoryName() {
        // TODO: Extract Regex to shared variable with owner()
        return (await this.remote()).match(/\/(\w+)\/([\w-]+).git$/)[2];
    }

    /**
     * Returns the SHA of the commit pointed to by HEAD.
     * @async
     * @throws Throws if unable to retrieve HEAD
     * @returns {string} sha - SHA of the commit where HEAD is pointed
     */
    async headSha() {
        try {
            return await execa.stdout('git', [ 'rev-parse', 'HEAD' ]);
        }
        catch (e) {
            throw new Error('There was a problem trying to retrieve the SHA of HEAD');
        }
    }

    /**
     * Returns the SHA of the head of the local branch.
     * @async
     * @throws Throws if unable to retrieve HEAD of the local branch
     * @param {string} branchName - The branch to consider
     * @returns {string} sha - SHA of the head of the local branch
     */
    async localSha(branchName) {
        try {
            return await execa.stdout('git', [ 'rev-parse', branchName ]);
        }
        catch (e) {
            throw new Error(`There was a problem trying to retrieve the HEAD of ${branchName}`);
        }        
    }
}

module.exports = GitProvider;
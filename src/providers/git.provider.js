const execa = require('execa');
const verifyGitProvider = require('../verify.git.provider');
const { GITLAB_TOKEN, GITHUB_TOKEN } = require('../utils/constants');

/**
 * Provides git repository information by executing git commands.
 * @class
 */
class Git {
    /**
     * Get name and commit sha from the current branch.
     * @static
     * @async
     * @returns {object} branch - { name, sha }
     */
    static async branch() {
        try {            
            const name = await execa.stdout('git', [ 'rev-parse', '--abbrev-ref', 'HEAD' ]);
            const sha = await execa.stdout('git', [ 'rev-parse', 'HEAD' ]);
            return { name, sha };            
        }
        catch (e) {
            throw new Error(`Something went wrong when trying to get branch information.\n${e.message}`);
        }
    }

    /**
     * Gets the configured remote repository.
     * @static
     * @async
     * @returns {string} remote - Repository URL
     */
    static async remote() {
        let origin = null;
        try {
            origin = await execa.stdout('git', [ 'config', '--get', 'remote.origin.url' ]);
        }
        catch {
            // There is no remote repository
            return null;
        }
        // No tokens were present, assume the repository is public and return remote
        if (!GITLAB_TOKEN && !GITHUB_TOKEN) {
            return origin;
        }
        if (await verifyGitProvider()) {
            // If the remote has a token we need to swap it out with the provided token
            if (/.+:.+@/.test(origin)) {
                return origin.replace(/^(https?:\/\/[^:]+):.+@(.+)/, `$1:${ GITLAB_TOKEN || GITHUB_TOKEN }@$2`)
            }
            // If there is no token present we add the provided token
            return origin.replace(/^(https?:\/\/)(.+)/, `$1oauth2:${GITLAB_TOKEN || GITHUB_TOKEN}@$2`);
        }
    }

    /**
     * Gets a list of tag references for the current repository.
     * @static
     * @async
     * @returns {string} A string of newline delimited tag references
     */
    static async tags() {
        const remote = await this.remote();
        /**
         * We want to allow the option to generate a latest version for local git repositories.
         * In the case of no version tags, start from version zero.
         */
        try {
            if (!remote) {
                return await execa.stdout('git', [ 'tag' ]);
            }
            return await execa.stdout('git', [ 'ls-remote', '--tags', remote ]);
        }
        catch (e) {
            throw new Error(`There was an error trying to retrieve git tags${remote ? ` from ${remote}` : ''}.`);
        }
    }

    /**
     * Get the commit log for the current repository.
     * @static
     * @async
     * @returns {string} log - A string of newline delimited commit messages
     */
    static async log() {
        try {
            return await execa.stdout('git', [ 'log', '--pretty=oneline', '--first-parent', '--no-merges', '--reverse' ]);
        }
        catch (e) {
            throw new Error('There was a problem trying to retrieve the commit logs.');
        }
    }

    /**
     * Gets a list of commits.
     * @static
     * @async
     * @returns {string[]} commits - A list of commits, sha and message
     */
    static async commits() {
        const log = await this.log();
        return log.split('\n');
    }

    /**
     * Gets the owner name from the remote repository.
     * @static
     * @async
     * @returns {string} owner - Name of the repository owner
     */
    static async owner() {
        return (await this.remote()).match(/\/(\w+)\/(\w+).git$/)[1];
    }

    /**
     * Gets the name of the repository.
     * @static
     * @async
     * @returns {string} repoistoryName - Name of the repository
     */
    static async repositoryName() {
        return (await this.remote()).match(/\/(\w+)\/(\w+).git$/)[2];
    }

    /**
     * Returns the SHA of the commit pointed to by HEAD.
     * @static
     * @async
     * @returns {string} sha - SHA of the commit where HEAD is pointed
     */
    static async headSha() {
        try {
            return await execa.stdout('git', [ 'rev-parse', 'HEAD' ]);
        }
        catch (e) {
            throw new Error('There was a problem trying to retrieve the SHA of HEAD.');
        }
    }

    /**
     * Returns the SHA of the head of the local branch.
     * @static
     * @async
     * @param {string} branchName - The branch to consider
     * @returns {string} sha - SHA of the head of the local branch
     */
    static async localSha(branchName) {
        try {
            return await execa.stdout('git', [ 'rev-parse', branchName ]);
        }
        catch (e) {
            throw new Error(`There was a problem trying to retrieve the HEAD of ${branchName}.`);
        }        
    }
}

module.exports = Git;
const execa = require('execa');
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
        if (GITLAB_TOKEN && GITHUB_TOKEN) {        
            throw new Error('Found both GitLab and GitHub token, please supply one or the other.');
        }
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
        // If the remote has a token we need to swap it out with the provided token
        if (/.+:.+@/.test(origin)) {
            return origin.replace(/^(https?:\/\/[^:]+):.+@(.+)/, `$1:${ GITLAB_TOKEN || GITHUB_TOKEN }@$2`)
        }
        // If there is no token present we add the provided token
        return origin.replace(/^(https?:\/\/)(.+)/, `$1oauth2:${GITLAB_TOKEN || GITHUB_TOKEN}@$2`);
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
}

module.exports = Git;
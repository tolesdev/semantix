const Parser = require('../utils/parser');
const Logger = require('../utils/logger');
const semver = require('semver');
const { MAJOR, MINOR, PATCH } = require('../utils/constants');

/** Provides version information based off commit history. */
class VersionProvider {
    /** Creates a VersionProvider. */
    constructor(configuration) {
        this.config = configuration;
        this.log = new Logger(this.config.verbose());
    }
    /**
     * Get the current version of this repository.
     * @async
     * @param {string} remote - Remote repository URL
     * @param {string} tags - String of newline delimited tag references
     * @returns {object} version - { sha, version }
     */
    async current({remote, tags}) {
        if (!tags) {
            this.log.debug('VersionProvider', 'No tags found, starting at v0.0.0');
            return { sha: null, version: '0.0.0' };
        }
        try {
            const gitRefsVersionTag = /(v\d+\.\d+\.\d+)$/;
            const current = tags
                .split('\n')
                // Filter out refs that are not version tags
                .filter(ref => gitRefsVersionTag.test(ref))
                // Split sha and ref
                .map(ref => ref.split('\t'))
                // Extract the versions from the refs
                .map(ref => {
                    if (!remote) {
                        // Local tags won't have a commit hash in the output so add a null value
                        ref.unshift(null);
                    }
                    ref[1] = ref[1].match(gitRefsVersionTag)[0];
                    return ref;
                })
                .map(ref => ({
                    sha: ref[0],
                    version: semver.valid(ref[1])
                }))
                // Sort versions ascending
                .sort((a, b) => {
                    return semver.gt(a.version, b.version);
                })
                // Take the highest version
                .pop();
            return current;
        }
        catch (e) {
            throw new Error('There was an error trying to determine the current version.')
        }
    }

    /**
     * Gets the next version.
     * @param {string} remote - Remote repository URL
     * @param {string} tags - String of newline delimited tag references
     * @param {string} commits - String of newline delimited commits
     * @returns {string} version - The next version for the project X.X.X
     */
    async next({remote, tags, commits }) {
        const current = await this.current({remote, tags});
        const release = new Map(Object.entries(this.config.mapping()));
        const parsedCommits = await Parser.commits(commits, current.sha);
        if (!parsedCommits) return current.version;
        // Increment the version based on the commits after the last tagged version
        return parsedCommits.reduce((latest, commit) => {
            if ([MAJOR, MINOR, PATCH].includes(release.get(commit.keyword))) {
                return semver.inc(latest, release.get(commit.keyword));
            }
            return latest;
        }, current.version);
    }
}

module.exports = VersionProvider;
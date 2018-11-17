const Git = require('./git.provider');
const Parser = require('../utils/parser');
const semver = require('semver');
const { MAJOR, MINOR, PATCH } = require('../utils/constants');

class Version {
    /**
     * Get the current version of this repository.
     * @static
     * @async
     * @returns {object} version - { sha, version }
     */
    static async current() {
        const remote = await Git.remote();
        const tags = await Git.tags();
        if (!tags) {
            return { sha: null, version: '0.0.0' };
        }
        try {
            const gitRefsVersionTag = /(v\d+\.\d+\.\d+)$/;
            return tags
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
        }
        catch (e) {
            throw new Error('There was an error trying to determine the current version.')
        }
    }

    /**
     * Gets the next version.
     * @param {object} mapping - Definition for the keyword mapping
     * @returns {string} version - The next version for the project X.X.X
     */
    static async next(mapping) {
        const current = await this.current();
        const release = new Map(Object.entries(mapping));
        const commits = await Parser.commits(await Git.commits(), current.sha);

        // Increment the version based on the commits after the last tagged version
        return commits.reduce((latest, commit) => {
            if ([MAJOR, MINOR, PATCH].includes(release.get(commit.keyword))) {
                return semver.inc(latest, release.get(commit.keyword));
            }
            return latest;
        }, current.version);
    }
}

module.exports = Version;
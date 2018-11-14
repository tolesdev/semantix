const execa = require('execa');
const semver = require('semver');
const { MAJOR, MINOR, PATCH } = require('../constants');

module.exports = async releaseMapping => {
    try {
        const versionInfo = await getLatestVersion();
        const next = await getNextVersion(versionInfo, releaseMapping);
        return { 
            next,
            latest: versionInfo.version
        };
    }
    catch(error) {
        console.error(error);
    }
}

const regex = {
    keywordScope: /([^\(]*)\(?([^\)]*)\)?/,
    /**
     * Check commit messages for refs information.
     */
    logsOrigin: /^\x28.+\x29\s(.+)/,
    /**
     * Matches on "v#.#.#" format at the end of a string.
     */
    gitRefsVersionTag: /(v\d+\.\d+\.\d+)$/,
    /**
     * Matches expected commit message format for semver tracking.
     */
    gitCommitMessageFormat: /^\s*([^:\s]+)\s*:(.+)/,
    /**
     * Split the result of our git log call into sha group and message group.
     */
    splitGitLog: /(\S+)\s(.+)/
};

const getLatestVersion = async () => {
    const gitLsRemote = await execa.stdout('git', [ 'ls-remote', '--tags' ]);
    const getLatest = versionList => {
        return versionList
            .split('\n')
            // Filter out refs that are not version tags
            .filter(ref => regex.gitRefsVersionTag.test(ref))
            // Split sha and ref
            .map(ref => ref.split('\t'))
            // Extract the versions from the refs
            .map(ref => {
                ref[1] = ref[1].match(regex.gitRefsVersionTag)[0];
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
            // Take the latest version { sha, version }
            .pop();
    }
    /**
     * We want to allow the option to generate a latest version for local git repositories.
     * In the case of no remotes start from version zero.
     */
    if (gitLsRemote.includes('No remote configured') || gitLsRemote === '') {
        const gitTags = await execa.stdout('git', [ 'tag' ]);
        if (gitTags === '') {
            return { sha: null, version: '0.0.0' };
        }
        return { sha: null, version: getLatest(gitTags).version };
    }
    
    return getLatest(gitLsRemote);
}

const getNextVersion = async (latestVersion, releaseMapping) => {    
    const release = new Map(Object.entries(releaseMapping));
    const gitLog = await execa.stdout('git', [ 'log', '--pretty=oneline', '--first-parent', '--no-merges', '--reverse' ]);
    if (gitLog.includes('does not have any commits')) {
        throw new Error('No commits found for this repository.');
    }
    const gitLogSplit = gitLog.split('\n');
    // If not found findIndex returns -1 which will equal out to the desired splice index at 0
    const spliceIndex = 1 + gitLogSplit.findIndex(commit => {
        return commit.includes(latestVersion.sha);
    });
    const commits = gitLogSplit
        /**
         * Drop the commit with the latest version tag and it's predecessors\
         * If no latest verison tag then return all and start from the beginning
         */
        .splice(spliceIndex)
        // Split the commit message into object with the sha and message properties
        .map(output => {
            const [ , sha, message ] = output.match(regex.splitGitLog);
            return { sha, message };
        })
        // Remove refs information from commit message
        .map(commit => {
            // Drop refs information from log message
            // i.e. (origin -> blah) test(feature1): commit
            if (regex.logsOrigin.test(commit.message)) {
                commit.message = commit.message.match(regex.logsOrigin)[1];
                return commit;
            }
            return commit;
        })
        // Split prefix into keyword and scope variables - format: keyword(scope)
        .map(commit => {
            const matches = commit.message.match(regex.gitCommitMessageFormat);            
            if (matches) {
                // Drop the match, we only want to save the groups from the match
                const [ , prefix, message ] = matches;
                const [ , keyword, scope ] = prefix.match(regex.keywordScope);
                return { message, keyword, scope };
            }
            return {};
        });

    // Increment the version based on the commits after the last tagged version
    return commits.reduce((latest, commit) => {
        if ([MAJOR, MINOR, PATCH].includes(release.get(commit.keyword))) {
            return semver.inc(latest, release.get(commit.keyword));
        }
        return latest;
    }, latestVersion.version);
}
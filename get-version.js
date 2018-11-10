const execa = require('execa');
const semver = require('semver');
const path = require('path');
const pkg = require(path.resolve(process.cwd(), 'package.json'));
const { MAJOR, MINOR, PATCH } = require('./constants');

module.exports = async () => {
    try {
        const versionInfo = await getCurrentVersion();
        const next = await getNextVersion(versionInfo);
        return { 
            current: versionInfo.version, 
            next 
        };
    }
    catch(error) {
        console.error(error);
    }
}

const regex = {
    keywordScope: /(.+)\((.+)\)/,
    /**
     * Check commit messages for refs information.
     */
    logsOrigin: /^\x28.+\x29(.+)/,
    /**
     * Matches on "v#.#.#" format at the end of a string.
     */
    gitRefsVersionTag: /(v\d+\.\d+\.\d+)$/,
    /**
     * Matches expected commit message format for semver tracking.
     */
    gitCommitMessageFormat: /([^:]+):(.+)/
};
const releaseMapping = {
    'BREAKING': MAJOR,
    'BREAKING CHANGE': MAJOR,
    'BREAKING CHANGES': MAJOR,
    'feat': MINOR,
    'perf': MINOR,
    'init': PATCH,
    'chore': PATCH,
    'fix': PATCH,
    'test': PATCH,
    'docs': PATCH
};
const release = new Map(Object.entries(releaseMapping));

const getCurrentVersion = async () => {
    const gitLsRemote = await execa.stdout('git', [ 'ls-remote', '--tags' ]);
    const getCurrent = versionList => {
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
                version: ref[1]
            }))
            // Properly sort the version list
            .sort((a, b) => {
                return semver.gt(a.version, b.version);
            })
            // Take the latest version { sha, version }
            .pop();
    }
    /**
     * We want to allow the option to generate a current version for local git repositories.
     * In the case of no remotes start from version zero.
     */
    if (gitLsRemote.includes('No remote configured')) {
        const gitTags = await execa.stdout('git', [ 'tag' ]);
        if (gitTags === '') {
            return { sha: null, version: 'v0.0.0' };
        }
        return { sha: null, version: getCurrent(gitTags).version };
    }
    
    return getCurrent(gitLsRemote);
}

const getNextVersion = async currentVersion => {    
    const gitLog = await execa.stdout('git', [ 'log', '--pretty=oneline', '--first-parent', '--no-merges', '--reverse' ]);
    if (gitLog.includes('does not have any commits')) {
        throw new Error('No commits found for this repository.');
    }
    const gitLogSplit = gitLog.split('\n');
    const spliceIndex = 1 + gitLogSplit.findIndex(commit => {
        return commit.includes(currentVersion.sha);
    });
    const commits = gitLogSplit
        /**
         * Drop the commit with the latest version tag and it's predecessors\
         * If no latest verison tag then return all and start from the beginning
         */
        .splice(currentVersion.sha ? spliceIndex : 0)
        // Split the commit message into object with the sha and message properties
        .map(output => {
            const [ , sha, message ] = output.match(/(\S+)(.+)/);
            return { sha, message };
        })
        // Remove refs information from commit message
        .map(commit => {
            // Drop refs information from log message
            // i.e. (origin -> blah) test(feature1): commit
            if (regex.logsOrigin.test(commit.message)) {
                commit.message = commit.message.replace(regex.logsOrigin, "$1");
                return commit;
            }
            return commit;
        })
        // Split prefix into keyword and scope variables - format: keyword(scope)
        .map(commit => {
            const [ , prefix, message ] = commit.message.match(regex.gitCommitMessageFormat).map(m => m.trim());
            const [ keyword, scope ] = prefix.replace(regex.keywordScope, '$1,$2').split(',');
            // console.log(`${keyword}${scope ? `(${scope})` : ''}: ${message}`);
            return { message, keyword, scope };
        });

    let nextVersion = currentVersion.version;

    // Increment the version based on the commits after the last tagged version
    commits.forEach(commit => {
        if ([MAJOR, MINOR, PATCH].includes(release.get(commit.keyword))) {
            nextVersion = semver.inc(nextVersion, release.get(commit.keyword));
        }
    });

    return `v${nextVersion}`;
}
const execa = require('execa');
const semver = require('semver');

module.exports = async () => {
    try {
        const currentVersion = await getCurrentVersion();
        const nextVersion = await getNextVersion(currentVersion);
        console.log('currentVersion: ', currentVersion);
        console.log('nextVersion: ', nextVersion);
        return nextVersion;
    }
    catch(error) {
        console.error(error);
    }
}

const commitHashLength = 40;
const regex = {
    /**
     * Allow any character for the 'keyword' but restrict to kebab-case
     * and camelCase for the 'scope'.
     */
    keywordScope: /(.*)\(([-a-zA-Z0-9]*)\)/,
    /**
     * Check git log messages for refs information.
     */
    logsOrigin: /^\x28.*\x29/,
    /**
     * Captures everything before the first space encountered.
     */
    splitOnFirstSpace: new RegExp(`^([a-zA-Z0-9]{${commitHashLength}}) `),
    /**
     * Matches on v#.#.# format at the end of a string.
     */
    gitRefsTag: /v\d\.\d\.\d$/
};
const releaseMapping = {
    'BREAKING': 'major',
    'BREAKING CHANGE': 'major',
    'BREAKING CHANGES': 'major',
    'feat': 'minor',
    'perf': 'minor',
    'chore': 'patch',
    'fix': 'patch',
    'test': 'patch',
    'docs': 'patch'
};
const release = new Map();

Object.keys(releaseMapping).forEach(key => {
    release.set(key, releaseMapping[key]);
});

const getCurrentVersion = async () => {
    const gitLsRemote = await execa.stdout('git', [ 'ls-remote', '--tags' ]);

    // If there are no remotes start the versioning at 0.0.0
    if (gitLsRemote.includes('No remote configured')) {
        return { sha: null, version: 'v0.0.0' };
    } else {
        const versionRef = gitLsRemote
            .split('\n')
            // Filter out refs that are not tags
            .filter(ref => regex.gitRefsTag.test(ref))
            // Take the most recent refs/tags
            .pop();

        // Split the commit message into object with the sha and version properties
        const [ sha, refName ] = versionRef.split('\t');
        // Get version off of the end of the ref
        const version = refName.split('/').pop();
        return { sha, version };
    }
}

const getNextVersion = async currentVersion => {    
    let nextVersion = currentVersion.version;

    const gitLog = await execa.stdout('git', [ 'log', '--pretty=oneline', '--first-parent', '--no-merges', '--reverse' ]);
    if (gitLog.includes('does not have any commits')) {
        throw new Error('No commits found for this repository.');
    }
    const gitLogSplit = gitLog.split('\n');
    const spliceIndex = 1 + gitLogSplit.findIndex(commit => {
        return commit.includes(currentVersion.sha);
    });
    const commits = gitLogSplit
        // Drop the commit with the latest version tag and it's predecessors
        .splice(currentVersion.sha ? spliceIndex : 0)
        // Split the commit message into object with the sha and message properties
        .map(output => {
            const [ sha, message ] = output.split(regex.splitOnFirstSpace).slice(1);
            return { sha, message };
        })
        // Remove refs information
        .map(commit => {
            // Drop refs information from log message
            // i.e. (origin -> blah) test(feature1): commit
            if (regex.logsOrigin.test(commit.message)) {
                commit.message = commit.message.substr(commit.message.search(/\x29/) + 1).trimLeft();
                return commit;
            }
            return commit;
        })
        // Split prefix into keyword and scope variables - format: keyword(scope)
        .map(commit => {                
            const [ prefix, message ] = commit.message.split(':').map(m => m.trim());
            const [ keyword, scope ] = prefix.replace(regex.keywordScope, '$1,$2').split(',');
            return { message, keyword, scope };
        });

    // Increment the version based on the commits after the last tagged version
    commits.forEach(commit => {
        if (['major', 'minor', 'patch'].includes(release.get(commit.keyword))) {
            nextVersion = semver.inc(nextVersion, release.get(commit.keyword));
        }
    });

    return nextVersion;
}
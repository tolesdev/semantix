const execa = require('execa');
const semver = require('semver');

const regex = {
    /**
     * Allow any character for the "keyword" but restrict to kebab-case
     * and camelCase for the "scope".
     */
    keywordScope: /(.*)\(([-a-zA-Z0-9]*)\)/,
    /**
     * Check git log messages for refs information.
     */
    logsOrigin: /^\x28.*\x29/
};
const commitHashLength = 4;
const keywordMap = {
    "init": "init",
    "launch": "launch",
    "BREAKING": "major",
    "BREAKING CHANGE": "major",
    "BREAKING CHANGES": "major",
    "feat": "minor",
    "perf": "minor",
    "chore": "patch",
    "fix": "patch",
    "test": "patch",
    "docs": "patch"
};
const version = { major: 0, minor: 0, patch: 0 };

module.exports = () => {
    return new Promise((resolve, reject) => {
        try {
            execa
                .stdout('git', [
                    'log',
                    '--pretty=oneline',
                    '--abbrev-commit',
                    `--abbrev=${commitHashLength}`,
                    '--first-parent',
                    '--no-merges',
                    '--reverse'
                ])
                .then(stdout => {
                    let output = stdout.split('\n');
                    output.push('5a6A (origin -> blah) test(feature1): commit');
                    output.push('5a6A test(feature2): commit');
                    output = output
                        // Remove the commit hash
                        .map(o => o.substr(commitHashLength).trimLeft())
                        // Remove origins info if present
                        .map(o => {
                            // Drop refs information from log message
                            if (regex.logsOrigin.test(o)) {
                                return o.substr(o.search(/\x29/) + 1).trimLeft();
                            }
                            return o;
                        })
                        .map(o => {                
                            const [ prefix, message ] = o.split(':').map(m => m.trim());
                            const [ keyword, scope ] = prefix.replace(regex.keywordScope, '$1,$2').split(',');
                            return { message, keyword, scope };
                        })
                        .forEach(commit => {
                            switch(keywordMap[commit.keyword]) {
                                case "launch":                    
                                    version.major = 1;
                                    version.minor = 0;
                                    version.patch = 0;
                                    break;
                                case "major":
                                    version.major++;
                                    version.minor = 0;
                                    version.patch = 0;
                                    break;
                                case "minor":
                                    version.minor++;
                                    version.patch = 0;
                                    break;
                                case "patch":
                                    version.patch++;
                                    break;
                                default:
                                    break;
                            }
                        });
                    resolve(semver.valid(`${version.major}.${version.minor}.${version.patch}`));
                });
        }
        catch(error) {
            reject(error);
        }
    });
}
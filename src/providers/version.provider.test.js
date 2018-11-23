 const happy_commits = 
`04b1c6b94f760d8ed630091bd71eefc0731d7224 init: So it begins!
fc0e994ff8c89e425bc3733aae8929016ad9b85b test: Test commit for analyzing commit history
f4294391bfb33f8d142fe8414205d0650f03f786 feat(get-version): Analyze git commits for determining project version
ba8dbf0962209bf58e6780969d2d156102ba4f14 chore(getVersion): Code cleanup
a717c31e7a33a8b49ad46bd76a24d03925682a51 feat: Verify Git and Node.js requirements
8bbbe06a3c56444a182a352cce3043b56f4cb37f feat(cli): Added "current" and "next" commands and various cli options
8c06b0f22551e7f7e42d136723a1e3f3389c4ad8 feat: Verify release branch conditions
9b658acb8e061aecedfe4303972ec4f1b5c2288f chore: Simplifying get version process and general refactor
f928f3468192d8a6b43367cfd9174945bc9359fb ci: Travis CI pipeline added, small refactor
22b87f8df11b6a613b856782596b43403e5572ea docs: README`;

const bad_commits = 
`04b1c6b94f760d8ed630091bd71eefc0731d7224 init: So it begins!
fc0e994ff8c89e425bc3733aae8929016ad9b85b test: Test commit for analyzing commit history
f4294391bfb33f8d142fe8414205d0650f03f786 feat(get-version): Analyze git commits for determining project version
ba8dbf0962209bf58e6780969d2d156102ba4f14 chore(getVersion): Code cleanup
a717c31e7a33a8b49ad46bd76a24d03925682a51 feat: Verify Git and Node.js requirements
8bbbe06a3c56444a182a352cce3043b56f4cb37f feat(cli): Added "current" and "next" commands and various cli options
8c06b0f22551e7f7e42d136723a1e3f3389c4ad8 feat: Verify release branch conditions
9b658acb8e061aecedfe4303972ec4f1b5c2288f chore: Simplifying get version process and general refactor
f928f3468192d8a6b43367cfd9174945bc9359fb ci: Travis CI pipeline added, small refactor
22b87f8df11b6a613b856782596b43403e5572ea docs: README`;

const currentVersion = '1.10.0';
const nextVersion = '2.1.0';
const currentVersionSHA = '174f665ac203db8cdfa56ff0eca3262ccaefdefd';

const remote_tags =
`1f94ad144cfc7a1227b9edb7a057bc7f835a7f32\trefs/tags/v0.10.0
${currentVersionSHA}\trefs/tags/v${currentVersion}
ef9375896c97e3cd89e537411ae64fa9edb0eae9\trefs/tags/test-tag
9ad791f8a3d0c9657deff9489f4975b70ab2199c\trefs/tags/v0.9.0
174f665ac203db8cdfa56ff0eca3262ccaefdefd\trefs/tags/random-tag
c0d856253bf8b7d41c60c038c49575bb17cc4cd9\trefs/tags/v0.9.3`;

const local_tags = 
`v${currentVersion}
v0.10.0
test-tag
v0.9.0
random-tag
v0.9.3`;

const parsedCommits = [
    {
        sha: '04b1c6b94f760d8ed630091bd71eefc0731d7224',
        message: 'So it begins!',
        keyword: 'init',
        scope: undefined
    },
    {},
    {
        sha: 'fc0e994ff8c89e425bc3733aae8929016ad9b85b',
        message: 'Test commit for analyzing commit history',
        keyword: 'test',
        scope: undefined
    },
    {},
    {
        sha: 'f4294391bfb33f8d142fe8414205d0650f03f786',
        message: 'Analyze git commits for determining project version',
        keyword: 'chore',
        scope: undefined
    },
    {
        sha: 'ba8dbf0962209bf58e6780969d2d156102ba4f14',
        message: 'Code cleanup',
        keyword: 'BREAKING',
        scope: undefined
    },
    {},
    {
        sha: 'a717c31e7a33a8b49ad46bd76a24d03925682a51',
        message: 'Verify Git and Node.js requirements',
        keyword: 'feat',
        scope: 'get-version'
    }    
]

const remote = 'https://github.com/btoles/semantix.git';

const VersionProvider = require('./version.provider');
const Configuration = require('./config.provider');
const Parser = require('../utils/parser');

describe('VersionProvider', () => {
    describe('current', () => {
        const config = new Configuration({}, null); // defaults
        const versionProvider = new VersionProvider(config);

        it('should return version zero if no tags', async () => {
            const current = await versionProvider.current({ remote, tags: null });
            expect(current.version).toBe('0.0.0');
            expect(current.sha).toBeNull();
        });

        it('should find highest release version (no remote)', async () => {
            const current = await versionProvider.current({ remote: null, tags: local_tags });
            expect(current.version).toBe(currentVersion);
            expect(current.sha).toBe(null);
        });

        it('should find the highest release version', async () => {
            const current = await versionProvider.current({ remote, tags: remote_tags });
            expect(current.version).toBe(currentVersion);
            expect(current.sha).toBe(currentVersionSHA);
        });
    });

    describe('next', () => {
        const config = new Configuration({}, null); // defaults
        const versionProvider = new VersionProvider(config);
        versionProvider.current = () => ({ sha: currentVersionSHA, version: currentVersion });
        Parser.commits = () => parsedCommits;

        it('should calculate next version from commits', async () => {
            // No need to pass parameters we're mocking Parser and current()
            const next = await versionProvider.next({});
            expect(next).toBe(nextVersion);
        });
    });
});
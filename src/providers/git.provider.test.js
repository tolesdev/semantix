const GitProvider = require('./git.provider');
const Configuration = require('./config.provider');

describe('GitProvider', () => {
    beforeEach(() => {
        jest.resetModules();
    });
    describe('remote.origin.url', () => {
        describe('SSH', () => {
            const GITHUB_TOKEN = 'TOKEN!@#';
            const config = new Configuration();
            config.accessToken = () => GITHUB_TOKEN;
            const git = new GitProvider(config);
            git.remote_raw = async () => 'git@github.com/btoles/semantix.git';

            it('should throw error', () => {
                git.remote().catch(err => {
                    expect(err).not.toBeUndefined();
                });
            });
        });
        describe('No Token Configured', () => {
            const config = new Configuration();
            const git = new GitProvider(config);
            git.remote_raw = async () => 'remote_raw';

            it('should not inject token into remote', async () => {
                expect(await git.remote()).toBe(await git.remote_raw());
            });
        });
        describe('Token Configured', () => {
            const GITHUB_TOKEN = 'TOKEN!@#';
            const config = new Configuration();
            config.accessToken = () => GITHUB_TOKEN;
            const git = new GitProvider(config);
            git.remote_raw = async () => 'https://github.com/btoles/semantix.git';

            it('should inject token into remote', async () => {
                expect(await git.remote()).toContain(GITHUB_TOKEN);
            });
        });
        describe('Remote Url Has A Token', () => {
            const GITHUB_TOKEN = 'TOKEN!@#';
            const config = new Configuration();
            config.accessToken = () => GITHUB_TOKEN;
            const git = new GitProvider(config);
            git.remote_raw = async () => 'https://oauth2:asdkf932f29fj@github.com/btoles/semantix.git';

            it('should inject user defined token into remote', async () => {
                expect(await git.remote()).toContain(GITHUB_TOKEN);
            });
        });
    });
});
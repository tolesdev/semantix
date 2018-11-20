const GitProvider = require('../src/providers/git.provider');
const Configuration = require('../src/providers/config.provider');
const test = jest.fn(() => null);
jest.mock('../src/providers/config.provider', () => {
  return jest.fn().mockImplementation(() => {
    return {
        accessToken: test
    };
  });
});

describe('GitProvider', () => {
    describe('remote', () => {
        const config = new Configuration();
        const Git = new GitProvider(config);

        describe('No Tokens', () => {
            Git.remote_raw = jest.fn(async () => remote_raw);

            it('should not inject token into remote', async () => {
                expect(test).toBeCalled();
                expect(await Git.remote()).toBe(await Git.remote_raw());
            });
        });

        // describe('Token Present', () => {
        //     const GITHUB_TOKEN = 'TOKEN!@#';
        //     const remote_raw = 'https://github.com/btoles/semantix.git';

        //     const Configuration = require('../src/providers/config.provider');
        //     const Verify = require('../src/utils/verify');
        //     const Git = require('../src/providers/git.provider');
        //     Configuration.prototype.accessToken = () => GITHUB_TOKEN;
        //     Verify.accessToken = () => true;
        //     Git.remote_raw = async () => remote_raw;

        //     it('should inject token into remote', async () => {
        //         expect(await Git.remote()).toContain(GITHUB_TOKEN);
        //     });
        // });

    });
});
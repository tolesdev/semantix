// const octokit = require('@octokit/rest');
const { GITHUB_TOKEN, GITHUB_URL, GITLAB_TOKEN, GITLAB_URL } = require('./utils/constants');


module.exports = async version => {
    if (GITHUB_TOKEN) {
        // const gitHub = new octokit({
        //     baseUrl: GITHUB_URL,
        //     type: 'token',
        //     token: GITHUB_TOKEN
        // });
        // console.log({
        //     owner: 'semantix',
        //     tag: `v${version}`,
        //     message: 'Semantix Release',
        //     repo: await getRemote(),
        //     type: 'commit',
        //     object: branch.sha
        // });
        // const result = await gitHub.gitdata.createTag({
        //     owner: 'btoles',
        //     tag: `v${version}`,
        //     message: 'Semantix Release',
        //     repo: await getRemote(),
        //     type: 'commit',
        //     object: branch.sha
        // });
        // console.log(result);
    }
    if (GITLAB_TOKEN) {
        // const gitLab = new Projects({
        //     url: GITLAB_URL,
        //     token: GITLAB_TOKEN
        // });
    }
}
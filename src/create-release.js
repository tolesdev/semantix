const { GITHUB_TOKEN, GITHUB_URL, GITLAB_TOKEN, GITLAB_URL } = require('../environment');
const octokit = require('@octokit/rest');
const { Projects } = require('gitlab');


module.exports = async nextVersion => {
    if (GITHUB_TOKEN && GITLAB_TOKEN) {
        throw new Error('Found both GitLab and GitHub token, please supply one or the other.');
    }
    if (GITHUB_TOKEN) {
        const gitHub = new octokit({
            baseUrl: GITHUB_URL,
            type: 'token',
            token: GITHUB_TOKEN
        });
    }
    if (GITLAB_TOKEN) {
        const gitLab = new Projects({
            url: GITLAB_URL,
            token: GITLAB_TOKEN
        });
    }
}
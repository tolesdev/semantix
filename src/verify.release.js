const { GITHUB_TOKEN, GITLAB_TOKEN, GITHUB_URL, GITLAB_URL } = require('./utils/constants');
const Git = require('./providers/git.provider');

module.exports = async (branchName, currentVersion, nextVersion) => {

    if (GITLAB_TOKEN && GITHUB_TOKEN) {        
        throw new Error('Found both GITLAB_TOKEN and GITHUB_TOKEN, please supply one or the other');
    }
    if (!GITLAB_TOKEN && !GITHUB_TOKEN) {        
        throw new Error('Either GITLAB_TOKEN or GITHUB_TOKEN must be provided to create a release');
    }
}
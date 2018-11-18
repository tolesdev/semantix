const { GITHUB_TOKEN, GITLAB_TOKEN, GITHUB_URL, GITLAB_URL } = require('./utils/constants');
const Git = require('./providers/git.provider');

module.exports = async (branchName, currentVersion, nextVersion) => {
    const HEAD_SHA = await Git.headSha();
    const LOCAL_SHA = await Git.localSha(branchName);

    if (HEAD_SHA !== LOCAL_SHA) {
        throw new Error(`HEAD is detached from ${branchName}`);
    }
    if (currentVersion === nextVersion) {
        throw new Error(`Release has already been created for version ${nextVersion}`);
    }
    if (GITLAB_TOKEN && GITHUB_TOKEN) {        
        throw new Error('Found both GITLAB_TOKEN and GITHUB_TOKEN, please supply one or the other');
    }
    if (!GITLAB_TOKEN && !GITHUB_TOKEN) {        
        throw new Error('Either GITLAB_TOKEN or GITHUB_TOKEN must be provided to create a release');
    }
    if (!GITLAB_URL && !GITHUB_URL) {        
        throw new Error(`${GITLAB_TOKEN ? `GITHUB_URL` : `GITHUB_URL`} variable is missing`);
    }
    return true;
}
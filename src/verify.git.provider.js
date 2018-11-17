const { GITHUB_TOKEN, GITLAB_TOKEN } = require('./utils/constants');

module.exports = async () => {    
    if (GITLAB_TOKEN && GITHUB_TOKEN) {        
        throw new Error('Found both GitLab and GitHub token, please supply one or the other.');
    }
    return true;
};
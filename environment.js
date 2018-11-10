require('dotenv').config();
const { isCi, branch } = require('env-ci')();

module.exports = { 
    IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
    GITHUB_TOKEN: process.env.GH_TOKEN || process.env.GITHUB_TOKEN,
    GITLAB_TOKEN: process.env.GL_TOKEN || process.env.GITLAB_TOKEN,
    GITHUB_URL: process.env.GH_URL || process.env.GITHUB_URL,
    GITLAB_URL: process.env.GL_URL || process.env.GITLAB_URL,
    IS_CI: isCi,
    CI_CURRENT_BRANCH: branch
};
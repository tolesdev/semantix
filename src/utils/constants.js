const dotenvExpand = require('dotenv-expand');
dotenvExpand(require('dotenv').config());
const [ MAJOR, MINOR, PATCH ] = [ 'major', 'minor', 'patch' ];

module.exports = {
    MAJOR,
    MINOR,
    PATCH,
    GITHUB: 'GitHub',
    GITLAB: 'GitLab',
    DEFAULTS: {
        RELEASE: {
            BREAKING: MAJOR,
            feat: MINOR,
            perf: MINOR,
            init: PATCH,
            chore: PATCH,
            fix: PATCH,
            test: PATCH,
            docs: PATCH
        },
        BRANCH: 'master'
    },
    // Environment Variables
    IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
    GITHUB_TOKEN: process.env.GH_TOKEN || process.env.GITHUB_TOKEN,
    GITLAB_TOKEN: process.env.GL_TOKEN || process.env.GITLAB_TOKEN,
    GITHUB_URL: process.env.GH_URL || process.env.GITHUB_URL,
    GITLAB_URL: process.env.GL_URL || process.env.GITLAB_URL
};
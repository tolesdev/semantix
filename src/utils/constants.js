const dotenvExpand = require('dotenv-expand');
dotenvExpand(require('dotenv').config());
const [ MAJOR, MINOR, PATCH ] = [ 'major', 'minor', 'patch' ];

module.exports = {
    MAJOR,
    MINOR,
    PATCH,
    GITLAB: 'gitlab',
    GITHUB: 'github',
    CONFIG_FILE: '.semantix.yml',
    DEFAULTS: {
        RELEASE: {
            BREAKING: MAJOR,
            feat: MINOR,
            perf: MINOR,
            refactor: MINOR,
            ci: PATCH,
            init: PATCH,
            chore: PATCH,
            fix: PATCH,
            test: PATCH,
            docs: PATCH
        },
        BRANCH: 'master'
    },
    // Environment Variables
    IS_DEVELOPMENT: process.env.NODE_ENV === 'development'
};
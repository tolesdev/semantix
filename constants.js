module.exports = {
    MAJOR: 'major',
    MINOR: 'minor',
    PATCH: 'patch',
    GITHUB: 'GitHub',
    GITLAB: 'GitLab',
    DEFAULTS: {
        RELEASE: {
            BREAKING: this.MAJOR,
            feat: this.MINOR,
            perf: this.MINOR,
            init: this.PATCH,
            chore: this.PATCH,
            fix: this.PATCH,
            test: this.PATCH,
            docs: this.PATCH
        },
        BRANCH: 'master'
    }
};
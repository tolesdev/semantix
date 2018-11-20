const GitHub = require('./services/github.service');
const GitLab = require('./services/gitlab.service');
const Parser = require('./utils/parser');
const Generate = require('./utils/generate');
const { GITHUB, GITLAB } = require('./utils/constants');

module.exports = async ({config, branchName, commits, mapping, headSHA, nextVersion, current, gitProvider, owner, repositoryName}) => {
    // Drop commits that don't match our keyword mapping before generating notes
    const keywordFilter = commit => mapping[commit.keyword] !== undefined;
    const parsed = (await Parser.commits(commits, current.sha)).filter(keywordFilter);
    const releaseNotes = await Generate.releaseNotes(mapping, parsed);
    const tag = `v${nextVersion}`;

    if (gitProvider === GITHUB) {
        const git = new GitHub({ config, owner, repositoryName });
        await git.createTag(tag, headSHA);
        await git.createRelease(branchName, tag, releaseNotes);
    }
    if (gitProvider === GITLAB) {
        const git = new GitLab({ config, owner, repositoryName });
        await git.createTag(tag, headSHA);
        await git.createRelease(branchName, tag, releaseNotes);
    }
};
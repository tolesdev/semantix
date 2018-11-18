const Git = require('./providers/git.provider');
const GitHub = require('./services/github.service');
const GitLab = require('./services/gitlab.service');
const Parser = require('./utils/parser');
const Generate = require('./utils/generate');
const Version = require('./providers/version.provider');
const verifyGitProvider = require('./verify.git.provider');
const { GITHUB_TOKEN, GITLAB_TOKEN } = require('./utils/constants');

module.exports = async (releaseBranch, releaseMapping) => {
    const commits = await Git.commits();
    const next = await Version.next(releaseMapping);
    const current = await Version.current();
    // Drop commits that don't match our keyword mapping before generating notes
    const keywordFilter = commit => releaseMapping[commit.keyword] !== undefined;
    const parsed = (await Parser.commits(commits, current.sha)).filter(keywordFilter);
    const releaseNotes = await Generate.releaseNotes(releaseMapping, parsed);

    if (await verifyGitProvider()) {
        const tag = `v${next}`;
        if (GITHUB_TOKEN) {
            const git = new GitHub();
            await git.createTag(tag, await Git.headSha());
            console.log(`💎 Successfully created tag ${tag}.`);
            await git.createRelease(releaseBranch, tag, releaseNotes);
            console.log(`🌠 Successfully created release ${tag}!`);
        }
        if (GITLAB_TOKEN) {
            const git = new GitLab();
            await git.createTag(tag, await Git.headSha(), releaseNotes);
            console.log(`🌠 Successfully created release ${tag}!`);
        }
    }
};
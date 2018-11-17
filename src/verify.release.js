const Git = require('./providers/git.provider');

module.exports = async branchName => {
    const headSha = await Git.headSha();
    const localSha = await Git.localSha(branchName);
    if (headSha === localSha) {
        return true;
    }
    throw new Error(`HEAD is detached from ${branchName}.`)
}
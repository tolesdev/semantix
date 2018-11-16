const execa = require('execa');

module.exports = async branchName => {
    const headSha = await execa.stdout('git', [ 'rev-parse', 'HEAD' ]);
    const localSha = await execa.stdout('git', [ 'rev-parse', branchName ]);
    if (headSha === localSha) {
        return true;
    }
    throw new Error(`HEAD is detached from ${branchName}.`)
}
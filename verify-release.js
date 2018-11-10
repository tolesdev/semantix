const execa = require('execa');

module.exports = async branch => {
    const headSha = await execa.stdout('git', [ 'rev-parse', 'HEAD' ]);
    const localSha = await execa.stdout('git', [ 'rev-parse', branch ]);
    const remoteSha = await execa.stdout('git', [ 'rev-parse', `origin/${branch}` ]);
    return headSha === localSha && localSha === remoteSha;
}
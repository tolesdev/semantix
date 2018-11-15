const execa = require('execa');
const { DEFAULTS } = require('../constants');

module.exports = async branch => {
    const headSha = await execa.stdout('git', [ 'rev-parse', 'HEAD' ]);
    const localSha = await execa.stdout('git', [ 'rev-parse', branch || DEFAULTS.BRANCH ]);
    const remoteSha = await execa.stdout('git', [ 'rev-parse', `origin/${ branch || DEFAULTS.BRANCH }` ]);
    return headSha === localSha && localSha === remoteSha;
}
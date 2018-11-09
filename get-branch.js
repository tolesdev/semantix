const execa = require('execa');

module.exports = async () => {
    return await execa.stdout('git', [ 'rev-parse', '--abbrev-ref', 'HEAD' ]);
};
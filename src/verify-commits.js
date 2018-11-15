const execa = require('execa');

module.exports = async () => {
    try {
        await execa.stdout('git', ['log']);
    }
    catch (e) {
        throw new Error('No commits found.');
    }
};
const execa = require('execa');

module.exports = async () => {
    try {
        await execa.stdout('git', ['log']);
        return true;
    }
    catch (e) {
        throw new Error('No commits found.');
    }
};
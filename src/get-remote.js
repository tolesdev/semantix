const execa = require('execa');
const dotenvExpand = require('dotenv-expand');
dotenvExpand(require('dotenv').config());

module.exports = async () => {
    let origin = null;
    const GITLAB_TOKEN = process.env.GL_TOKEN || process.env.GITLAB_TOKEN;
    const GITHUB_TOKEN = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
    const regex = {
        hasToken: /.+:.+@/,
        replaceToken: /^(https?:\/\/[^:]+):.+@(.+)/,
        addToken: /^(https?:\/\/)(.+)/
    };
    if (GITLAB_TOKEN && GITHUB_TOKEN) {        
        throw new Error('Found both GitLab and GitHub token, please supply one or the other.');
    }    
    try {
        origin = await execa.stdout('git', [ 'config', '--get', 'remote.origin.url' ]);
    }
    catch {
        // There is no remote repository
        return null;
    }
    // No tokens were present, assume the repository is public and return configured remote
    if (!GITLAB_TOKEN && !GITHUB_TOKEN) {
        return origin;
    }
    // If the remote has a token we need to swap it out with the provided token
    if (regex.hasToken.test(origin)) {
        return origin.replace(regex.replaceToken, `$1:${ GITLAB_TOKEN || GITHUB_TOKEN }@$2`)
    }
    // If there is no token present we add the provided token
    return origin.replace(regex.addToken, `$1oauth2:${GITLAB_TOKEN || GITHUB_TOKEN}@$2`);
};
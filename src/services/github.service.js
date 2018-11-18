const fetch = require('node-fetch');
const { Headers } = require('node-fetch');
const Git = require('../providers/git.provider');
const log = require('../utils/logger');
const { GITHUB_TOKEN, GITHUB_URL } = require('../utils/constants');

class GitHub {
    constructor() {
        this.baseURL = GITHUB_URL.endsWith('/')
                     ? GITHUB_URL.slice(0, -1)
                     : GITHUB_URL;
        this.headers = new Headers({
            'User-Agent': 'semantix',
            Accept: 'application/vnd.github.v3+json',
            Authorization: `token ${GITHUB_TOKEN}`,
            'Content-Type': 'application/json'
        });
    }

    async fetch(path, options) {
        path = path.replace(':owner', await Git.owner());
        path = path.replace(':repo', await Git.repositoryName());
        return await fetch(`${this.baseURL}${path}`, { ...options, headers: this.headers });
    }

    async createTag(tag, object) {
        try {
            const body = JSON.stringify({
                tag,
                object,
                email: 'semantix@github.com',
                type: 'commit'
            });
            const response = await this.fetch('/repos/:owner/:repo/git/tags', {
                method: 'POST',
                body
            });
            if (response.ok) {
                console.log(`💎 Successfully created tag ${tag}`);
            }
            return true;
        }
        catch (e) {
            throw new Error('There was a problem creating the release tag.');
        }
    }

    async createRelease(target_commitish, tag_name, _body) {
        console.log('🚀 Creating Release');
        log.print('Tag Name', tag_name);
        log.print('Branch', target_commitish);
        const body = JSON.stringify({
            tag_name,
            name: `Release ${tag_name}`,
            target_commitish,
            body: _body
        });
        const response = await this.fetch('/repos/:owner/:repo/releases', {
            method: 'POST',
            body
        });
        const responseBody = await response.json();
        if (responseBody.message.includes('Bad credentials')) {
            throw new Error('Bad credentials, check that your token is set.');
        }
        if (responseBody.message.includes('Validation Failed')) {
            if (responseBody.errors.find(e => e.code === 'already_exists')) {
                throw new Error(`Release ${tag_name} already exists.`);
            }
        }
        if (response.ok) {            
            console.log(`🌠 Successfully created release ${tag_name}!`);
        }
        return true;
    }
}

module.exports = GitHub;
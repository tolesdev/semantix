const fetch = require('node-fetch');
const { Headers } = require('node-fetch');
const Git = require('../providers/git.provider');
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

    async createTag(tag, object, message = '') {
        try {
            const body = JSON.stringify({
                tag,
                message,
                object,
                email: 'semantix@github.com',
                type: 'commit'
            });
            await this.fetch('/repos/:owner/:repo/git/tags', {
                method: 'POST',
                body
            });
            return true;
        }
        catch (e) {
            throw new Error('There was a problem creating the release tag.');
        }
    }

    async createReference(ref, sha) {
        try {
            const body = JSON.stringify({ ref, sha });
            await this.fetch('/repos/:owner/:repo/git/refs', {
                method: 'POST',
                body
            });
            return true;
        }
        catch (e) {
            throw new Error('There was a problem creating the tag reference.');
        }
    }

    async createRelease(target_commitish, tag_name, body) {
        try {
            const _body = JSON.stringify({
                tag_name,
                name: `Release ${tag_name}`,
                target_commitish,
                body
            });
            const response = await this.fetch('/repos/:owner/:repo/releases', {
                method: 'POST',
                _body
            });
            if (!response.ok) throw new Error('There was a problem creating the release.');
            return true;
        }
        catch (e) {
            throw new Error('There was a problem creating the release.');
        }
    }
}

module.exports = GitHub;
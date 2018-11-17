const fetch = require('node-fetch');
const { Headers } = require('node-fetch');
const Git = require('../providers/git.provider');
const { GITLAB_TOKEN, GITLAB_URL } = require('../utils/constants');

class GitLab {
    constructor() {
        this.baseURL = GITLAB_URL.endsWith('/')
                     ? GITLAB_URL.slice(0, -1)
                     : GITLAB_URL;
        this.headers = new Headers({
            'User-Agent': 'semantix',
            'Private-Token': GITLAB_TOKEN,
            'Content-Type': 'application/json'
        });
    }

    async fetch(path, options) {
        const id = encodeURIComponent(`${await Git.owner()}/${await Git.repositoryName()}`);
        path = path.replace(':id', id);
        return await fetch(`${this.baseURL}${path}`, { ...options, headers: this.headers });
    }

    async createTag(tag_name, ref, message = '') {
        try {
            const body = JSON.stringify({
                ref,
                tag_name,
                message,
                
                email: 'semantix@github.com',
                type: 'commit'
            });
            const response = await this.fetch('/projects/:id/repository/tags', {
                method: 'POST',
                body
            });
            if (response.ok) {
                return await this.createReference(`refs/tags/${tag}`, sha);
            }
        }
        catch (e) {
            throw new Error('There was a problem creating the release tag.');
        }
    }
}

module.exports = GitLab;
const fetch = require('node-fetch');
const { Headers } = require('node-fetch');
const Git = require('../providers/git.provider');
const log = require('../utils/logger');
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
    
    async createTag(tag_name, ref) {
        try {
            const body = JSON.stringify({
                ref,
                tag_name,
                email: 'semantix@github.com',
                type: 'commit'
            });
            const response = await this.fetch('/projects/:id/repository/tags', {
                method: 'POST',
                body
            });
            if (response.ok) {
                console.log(`💎 Successfully created tag ${tag_name}`);
            }
            return true;
        }
        catch (e) {
            throw new Error('There was a problem creating the release tag.');
        }
    }
    
    async createRelease(branch, tag_name, description) {
        console.log('🚀 Creating Release');
        log.print('Tag Name', tag_name);
        log.print('Branch', branch);
        const body = JSON.stringify({
            description
        });
        const response = await this.fetch(`/projects/:id/repository/tags/${tag_name}/release`, {
            method: 'POST',
            body
        });
        if (response.ok) {            
            console.log(`🌠 Successfully created release ${tag_name}!`);
        }
        return true;
    }
}

module.exports = GitLab;
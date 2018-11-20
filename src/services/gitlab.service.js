const fetch = require('node-fetch');
const { Headers } = require('node-fetch');
const Logger = require('../utils/logger');

/** Class to interact with a GitLab API. */
class GitLab {
    /**
     * Creates a new GitLab service.
     */
    constructor({ config, owner, repositoryName }) {
        const url = config.apiBaseUrl();
        this.log = new Logger(config.verbose());
        this.owner = owner;
        this.repositoryName = repositoryName;
        this.baseURL = url.endsWith('/')
                     ? url.slice(0, -1)
                     : url;
        this.headers = new Headers({
            'User-Agent': 'semantix',
            'Private-Token': config.accessToken(),
            'Content-Type': 'application/json'
        });
    }

    /**
     * Makes an HTTP/S request using node-fetch.
     * @param {string} path - Path to the API endpoint
     * @param {object} options - fetch options
     * @returns {Promise} - Response object
     */
    async fetch(path, options) {
        const id = encodeURIComponent(`${this.owner}/${this.repositoryName}`);
        path = path.replace(':id', id);
        return await fetch(`${this.baseURL}${path}`, { ...options, headers: this.headers });
    }
    
    /**
     * Creates a tag on a remote repository.
     * @param {string} tag_name - Tag name
     * @param {string} ref - SHA of the git object to tag
     * @returns {boolean} - true if successfully created
     */
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
    
    
    /**
     * Creates a release on GitLab.
     * @param {string} branch - Branch from which the release was created
     * @param {string} tag_name - Tag name
     * @param {string} description - The markdown supported message added to the release
     * @returns {boolean} - true if successfully created
     */
    async createRelease(branch, tag_name, description) {
        console.log('🚀 Creating Release');
        this.log.print('Tag Name', tag_name);
        this.log.print('Branch', branch);
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
const fetch = require('node-fetch');
const { Headers } = require('node-fetch');
const Logger = require('../utils/logger');

/** Class to interact with a GitHub API. */
class GitHub {
    /**
     * Creates a GitHub service.
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
            Accept: 'application/vnd.github.v3+json',
            Authorization: `token ${config.accessToken()}`,
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
        path = path.replace(':owner', this.owner);
        path = path.replace(':repo', this.repositoryName);
        return await fetch(`${this.baseURL}${path}`, { ...options, headers: this.headers });
    }

    /**
     * Creates a tag on a remote repository.
     * @param {string} tag - Tag name
     * @param {string} object - SHA of the git object to tag
     * @returns {boolean} - true if successfully created
     */
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
    
    /**
     * Creates a release on GitHub.
     * @param {string} target_commitish - Branch from which the release is created
     * @param {string} tag_name - Tag name
     * @param {string} body - The markdown supported message added to the release
     * @returns {boolean} - true if successfully created
     */
    async createRelease(target_commitish, tag_name, body) {
        console.log('🚀 Creating Release');
        this.log.print('Tag Name', tag_name);
        this.log.print('Branch', target_commitish);
        const _body = JSON.stringify({
            tag_name,
            name: `Release ${tag_name}`,
            target_commitish,
            body
        });
        const response = await this.fetch('/repos/:owner/:repo/releases', {
            method: 'POST',
            body: _body
        });
        const responseBody = await response.json();
        if (responseBody.message && responseBody.message.includes('Bad credentials')) {
            throw new Error('Bad credentials, check that your token is set.');
        }
        if (responseBody.message && responseBody.message.includes('Validation Failed')) {
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
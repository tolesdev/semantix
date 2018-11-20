const yaml = require('js-yaml');
const path = require('path');
const fs = require('fs');
const Logger = require('../utils/logger');
const Verify = require('../utils/verify');
const { DEFAULTS, CONFIG_FILE, GITLAB, GITHUB } = require('../utils/constants');
const dotenvExpand = require('dotenv-expand');
dotenvExpand(require('dotenv').config());

const GITHUB_TOKEN = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
const GITLAB_TOKEN = process.env.GL_TOKEN || process.env.GITLAB_TOKEN;
const GITHUB_URL = process.env.GL_URL || process.env.GITHUB_URL;
const GITLAB_URL = process.env.GL_URL || process.env.GITLAB_URL;

/** Class for consolidating all possible configurations. */
class Configuration {
    /**
     * Creates a Configuration object.
     * @param {object} args - Arguments from the command line
     * @param {string} configPath - Path to the .semantix.yml configuration file
     */
    constructor(args = {}, configPath = path.resolve(process.cwd(), CONFIG_FILE)) {
        this.log = new Logger(args.verbose);
        try {
            this.config = {};
            if (fs.existsSync(configPath)) {
                const config = yaml.safeLoad(fs.readFileSync(configPath), 'utf8');
                this.config = { ...config };
            }
            this.config = { ...this.config, ...args };
            this.log.debug('Configuration', `Successfully loaded configuration from ${configPath}`);
        }
        catch (e) {
            this.config = {};
            this.log.billboardWarning('There was an error loading your configuration, using defaults.')
            this.log.error(e.message);
        }
    }
    /**
     * Gets the release branch.
     * @returns {string} branch - The release branch
     */
    branch() {
        return this.config.branch || DEFAULTS.BRANCH;
    }
    /**
     * Gets the keyword to release type mapping.
     * @returns {object} mapping - Mapping of keywords to release types
     */
    mapping() {
        return this.config.release || DEFAULTS.RELEASE;
    }
    verbose() {
        return this.config.verbose;
    }
    /**
     * Gets the configured access token.
     * @returns {string} accessToken - The access token defined in environment variable
     */
    accessToken() {
        return GITHUB_TOKEN || GITLAB_TOKEN;
    }
    /**
     * Infers the git provider based on the token provided.
     * @throws {Error} - More than one token configured, also no tokens configured
     * @returns {string} gitProvider - GITLAB or GITHUB
     */
    gitProvider() {
        return GITHUB_TOKEN ? GITHUB : GITLAB;
    }
    /**
     * Gets the GitHub or GitLab API Base Url.
     * @throws {Error} - No API Base Url
     * @returns {string} apiBaseUrl - The base Url of the GitHub or GitLab API
     */
    apiBaseUrl() {
        return GITHUB_URL || GITLAB_URL;        
    }
}

module.exports = Configuration;
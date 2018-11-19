const yaml = require('js-yaml');
const path = require('path');
const fs = require('fs');
const log = require('../utils/logger');
const { DEFAULTS, CONFIG_FILE } = require('../utils/constants');

class Configuration {
    constructor(args = {}, configPath = path.resolve(process.cwd(), CONFIG_FILE)) {
        try {
            this.config = {};
            if (fs.existsSync(configPath)) {
                const config = yaml.safeLoad(fs.readFileSync(configPath), 'utf8');
                this.config = { ...config };
            }
            this.config = { ...this.config, ...args };
        }
        catch (e) {
            this.config = {};
            log.billboardWarning('There was an error loading your configuration, using defaults.')
            log.error(e.message);
        }
    }
    branch() {
        return this.config.branch || DEFAULTS.BRANCH;
    }
    mapping() {
        return this.config.release || DEFAULTS.RELEASE;
    }
}

module.exports = Configuration;
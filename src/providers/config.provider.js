const yaml = require('js-yaml');
const path = require('path');
const fs = require('fs');
const log = require('../utils/logger');
const { DEFAULTS, CONFIG_FILE } = require('../utils/constants');

class Configuration {
    constructor(args) {
        try {
            const configPath = path.resolve(process.cwd(), CONFIG_FILE);
            if (fs.existsSync(configPath)) {
                const config = yaml.safeLoad(fs.readFileSync(configPath), 'utf8');
                this.config = { ...config, ...args };
            }
        }
        catch (e) {
            this.config = {};
            log.error(e.message);
            log.billboardWarning('There was an error loading your configuration, using defaults.')
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
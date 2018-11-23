const Configuration = require('./config.provider');
const { DEFAULTS, CONFIG_FILE } = require('../utils/constants');
const path = require('path');
const fs = require('fs');
const configPath = path.resolve(__dirname, '../../tests', CONFIG_FILE);


describe('Configuration', () => {
    describe('Order of Precedence', () => {
        describe('CLI Arguments', () => {
            it('should override config and defaults', () => {
                const branch = 'args-branch';
                const config = new Configuration({branch});
                expect(config.branch()).toBe(branch);
            });
        });
        describe('No CLI Arguments', () => {
            it('should load config file values', () => {
                const config = new Configuration({}, configPath);
                expect(config.branch()).toBe('test-branch');
                expect(JSON.stringify(config.mapping())).toBe(JSON.stringify({
                    BREAKING: 'major',
                    feature: 'minor',
                    fix: 'patch'                    
                }));
            });
        });
        describe('No CLI, No Config File', () => {
            it('should load default values', () => {
                fs.existsSync = jest.fn(() => false);
                const config = new Configuration();
                expect(config.branch()).toBe(DEFAULTS.BRANCH);
                expect(JSON.stringify(config.mapping())).toBe(JSON.stringify(DEFAULTS.RELEASE));
            })
        });
    });
});
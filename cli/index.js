const getVersion = require('../get-version');
const verifyRequirements = require('../verify-requirements');
const semver = require('semver');
const pkg = require('../package.json');
const log = require('../classes/Logger');

(async () => {
    try {
        await verifyRequirements();
    }
    catch (error) {
        log.billboardError(error.message);
    }
    try {
        await getVersion();        
    }
    catch (error) {
        log.error(error.message);
    }
    if (!semver.satisfies(process.version, pkg.engines.node)) {
        log.billboardError(`Node version out of date, expected >=6.0.0 but found ${process.version}.`);
    }
})();
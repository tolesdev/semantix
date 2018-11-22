const chalk = require('chalk');
const boxen = require('boxen');
const { IS_DEVELOPMENT } = require('./constants');

class Logger {
    constructor(verbose) {
        this.debugLog = verbose || IS_DEVELOPMENT;
    }
    print(key, msg, color = 'blue') {
        console.log(`${chalk[color](key)}: ${msg}`);
    }
    error(output) {
        const log = output => {
            return this.debugLog 
                    ? console.log(`semantix(Error): ${output}`)
                    : null;
        }
        if (typeof output === 'string') {
            log(output)
        }
        else if (typeof output === 'object') {
            log(JSON.stringify(output));
        }
        else {
            output.forEach(log);
        }
    }

    debug(scope, output) {
        const log = output => {
            return this.debugLog 
                    ? console.log(`semantix${scope ? `(${scope})` : ''}: ${output}`)
                    : null;
        }
        if (typeof output === 'string') {
            log(output)
        }
        else if (typeof output === 'object') {
            log(JSON.stringify(output));
        }
        else {
            output.forEach(log);
        }
    }

    billboardError(msg) {
        console.log(
            chalk.red(
                boxen(
                    chalk.white(msg),
                    {
                        padding: 1,
                        margin: 1,
                        borderStyle: 'single'
                    }
                )
            )
        );
    }
    
    billboardWarning(msg) {
        console.log(
            chalk.yellow(
                boxen(
                    chalk.white(msg),
                    {
                        padding: 1,
                        margin: 1,
                        borderStyle: 'single'
                    }
                )
            )
        );
    }
}

module.exports = Logger;
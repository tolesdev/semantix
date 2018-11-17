const chalk = require('chalk');
const boxen = require('boxen');

class Logger {
    error(output) {
        const logOutput = output => console.log(`${logSymbols.error} ${output}`);
        console.log(`${chalk.bgBlue.white(' semantix ')}${chalk.bgRed(' ERROR ')}  `);
        if (typeof output === 'string') {
            logOutput(output)
        }
        else if (typeof output === 'object') {
            logOutput(JSON.stringify(output));
        }
        else {
            output.forEach(logOutput);
        }
        this.debug([`typeof output = ${typeof output}`]);
    }

    debug(output) {
        const logOutput = output => console.log(`${logSymbols.warning} ${output}`);
        console.log(`${chalk.bgBlue.white(' semantix ')}${chalk.bgYellow.black(' DEBUG ')}  `);
        if (typeof output === 'string') {
            logOutput(output)
        }
        else {
            output.forEach(logOutput);
        }
    }

    billboardError(msg) {
        console.log(
            chalk.red(
                boxen(
                    chalk.white(`🚨  ${msg}`),
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
                    chalk.white(`⚠  ${msg}`),
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

module.exports = new Logger();
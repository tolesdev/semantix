class Parser {
    /**
     * Gets a list of parsed commits.
     * @static
     * @async
     * @param {string[]} commits - A list of commits
     * @param {string} start - The sha from which to start parsing
     * @returns {Object[]} parsedCommits - { sha, message, keyword, scope }
     */
    static async commits(commits, start) {
        // If not found findIndex returns -1 which will equal out to the desired splice index at 0
        const spliceIndex = 1 + commits.findIndex(commit => {
            return commit.includes(start);
        });
        return commits
            /**
             * Drop the commit with the latest version tag and it's predecessors\
             * If no latest verison tag then return all and start from the beginning
             */
            .splice(spliceIndex)
            // Split the commit message into object with the sha and message properties
            .map(output => {
                const [ , sha, message ] = output.match(/(\S+)\s(.+)/);
                return { sha, message };
            })
            // Remove refs information from commit message
            .map(commit => {
                const logsOrigin = /^\x28.+\x29\s(.+)/;
                // Drop refs information from log message
                // i.e. (origin -> blah) test(feature1): commit
                if (logsOrigin.test(commit.message)) {
                    commit.message = commit.message.match(logsOrigin)[1];
                    return commit;
                }
                return commit;
            })
            // Split prefix into keyword and scope variables - format: keyword(scope)
            .map(commit => {
                const { sha, message } = commit;
                const matches = message.match(/^\s*([^:\s]+)\s*:(.+)/);            
                if (matches) {
                    // Drop the match, we only want to save the groups from the match
                    const [ , prefix, message ] = matches;
                    const [ , keyword, scope ] = prefix.match(/([^\(]*)\(?([^\)]*)\)?/);
                    return { sha, message, keyword, scope };
                }
                return {};
            });
    }
}

module.exports = Parser;
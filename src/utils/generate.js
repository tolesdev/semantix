const { MAJOR, MINOR, PATCH } = require('./constants');
const NO_SCOPE = 'none';
const TemplateBuilder = require('../utils/template');
/** Generator class. */
class Generate {
    /**
     * Generates release notes from commit objects.
     * @param {object[]} releaseMapping - A mapping of keywords to release types
     * @param {object[]} parsedCommits - { sha, message, keyword, scope }
     * @returns {string} releaseNotes - Release notes in markdown format
     */
    static async releaseNotes(releaseMapping, parsedCommits) {
        const _releaseMapping = {};
        parsedCommits.forEach(commit => {
            const { message, keyword, scope } = commit;
            // Get the release type from the commit keyword
            const releaseType = releaseMapping[keyword];
            // Ignore patch commits for relase notes
            if (releaseType === PATCH) return;
            // Get the mapping of scopes -> messages
            const scopeMapping = _releaseMapping[releaseType];
            // We want to group the scopeless messages together to default to 'none'
            const _scope = scope || NO_SCOPE;

            if (scopeMapping) {
                const messages = scopeMapping[_scope];
                if (messages) {
                    messages.push(message);
                }
                else {
                    scopeMapping[_scope] = [ message ];
                }
            }
            else {
                _releaseMapping[releaseType] = {
                    [_scope]: [ message ]
                };
            }
        });

        const headers = {
            [MAJOR]: '*BREAKING CHANGES*',
            [MINOR]: 'Features & Performance'
        };
        
        let templateBuilder = new TemplateBuilder();

        Object.keys(_releaseMapping).forEach(release => {
            templateBuilder = templateBuilder.Section(headers[release]);

            const scopes = _releaseMapping[release];
            Object.keys(scopes).forEach(scope => {
                const list = scopes[scope].map(x => x.trim());
                if (scope === NO_SCOPE) {
                    templateBuilder = templateBuilder.SubSectionNoHeader(list);
                }
                else {
                    templateBuilder = templateBuilder.SubSection(scope, list);
                }
            });
        });

        return templateBuilder.Build();
    }
}

module.exports = Generate;
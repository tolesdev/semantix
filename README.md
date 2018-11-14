# 🌠semantix
> *Semantix is a tool that analyzes your repository's commit history and generates the appropriate semantic version based off keywords found in the commit messages*
### Table of Content
- [🚀 Installation](#installation)
- [🔨 Usage](#usage)
    - [📚 Commit Format](#commit-format)
    - [📦 package.json](#packagejson)
    - [⌨ Command Line](#command-line)
        - [🛠 Commands](#commands)
        - [⚙ Options](#options)
- [🌈 Order of Precedence](#order-of-precedence)
- [📂 Configuration](#configuration)
# 📈 Progress
- [x] Generate current and latest version
- [x] Update *package.json* with latest version
- [ ] Tag release branch with release versions
    - [ ] GitLab
    - [ ] GitHub
- [ ] Publish package to npm registry

# Installation
```
npm install --save semantix
```
📃[Back to Table of Content](#table-of-content)
# Usage
## Commit Format
`keyword`: A predefined string indicating how much to bump the project version.

`scope`: An ***optional*** argument specifying the scope of the commit -- used in the release process to annotate release tags and generate changelogs.

```
keyword(scope): This is my commit message!
```

> 🚨 **NOTE**: Be careful when merging pull requests and using the *squash* feature.  Commit messages need to maintain their specific format in order to be picked up by the *semantix* commit parser.

## package.json
*Example*
```json
"scripts": {
    "upgrade": "semantix upgrade" 
}
```
## Command Line
```
npx semantix <command> [option]
```

### Commands
|Command|Description|
|:----:|:-----|
|`latest`|Returns the version of the latest release.|
|`next`|Returns the next release version.|
|`update`|Updates the package.json with the next release version.|

### Options
|Option|Alias|Description|
|:----:|:-----:|:---|
|`--branch`|`-b`|Specify the branch from which to release.|
|`--repository`|`-r`|Specify the repository to be considered during the release process. 

📃[Back to Table of Content](#table-of-content)

# Order of Precedence
If no additional options are given to *semantix* then the default values will be used. Otherwise, values will be read from the the command line `--options` first and the missing variables filled in with the `semantix.yml` configuration file.  

It is recommended to use `semantix.yml` for all your configuration and only use the command line `--options` as overrides.


# Configuration
> *You may store your configuration and override some defaults in a `semantix.yml` file*
## *semantix.yml*
```yml
branch: master
repository: https://github.com/btoles/semantix.git
release:
    BREAKING: major
    feat: minor
    perf: minor
    init: patch
    chore: patch
    fix: patch
    test: patch
    docs: patch
```
|Key|Type|Description|Default
|---|----|----|:---:|
|`release`|object|Mapping of keywords to semantic version increment amounts.|*See example*
|`branch`|string|The branch to be considered for releases.|*See example*
|`repository`|string|The repository URL|*None*

> 🚨 **NOTE**: If **repository** is omitted from `semantix.yml` and `--options`, *semantix* will fall back on the value defined in `package.json`.

📃[Back to Table of Content](#table-of-content)
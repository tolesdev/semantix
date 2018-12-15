# semantix
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
- [ ] Generate CHANGELOG.md
- [x] Generate current and latest version
- [x] Update *package.json* with latest version
- [x] Private repository support
- [x] Tag release branch with release versions
    - [x] GitLab
    - [x] GitHub
    - [x] Release Notes

# Installation
```
npm install --save semantix
```
📃[Back to Table of Content](#table-of-content)
# Usage
Semantix keeps track of your projects version number and generates release notes/changelogs automatically.  All that needs to be done to leverage Semantix is to format your commits in a specific way.
## Commit Format
`keyword`: A predefined string indicating how much to bump the project version.

`scope`: An ***optional*** argument specifying the scope of the commit -- used in the release process to annotate release tags and generate changelogs.

Mapping specific `keyword` to release types (major, minor, patch) can be customized and defined in a `.semantix.yml` configuration file.

```
keyword: 🍔🥓🍟
keyword(scope): This is my commit message!
```

> 🚨 **NOTE**: Be careful when merging pull requests and using the *squash* feature.  Commit messages need to maintain their specific format in order to be picked up by the *semantix* commit parser.

## package.json
*Example*
```json
"scripts": {
    "latest": "semantix latest",
    "next": "semantix next",
    "update": "semantix update",
    "release": "semantix release"
}
```
## Command Line
```
npx semantix <command> [option]
```

### Commands

### latest
Checks repository tags to determine the latest release version.

---
### next
Checks repository tags to determine the latest version and calculates the next release version based off of the commit history after the latest release.

---
### update
Update your package.json with the projects next version.

---
### release
> In order to use this feature you must provide a set of environment variables for *semantix* to use.

Creates a tag and release in your **GitLab** or **GitHub** remote repository.

### **Requirements**: 
#### 😸 GitHub
|Variable|Name|
|:-:|:-:|
|Access Token| `GITHUB_TOKEN` or `GH_TOKEN`|
|GitHub API URL| `GITHUB_URL`|

#### 🦊 GitLab
|Variable|Name|
|:-:|:-:|
|Access Token| `GITLAB_TOKEN` or `GL_TOKEN`|
|GitHub API URL| `GITLAB_URL`|

### Options
|Option|Description|
|:----:|:---|
|`--branch`|Specify the branch from which to release.|

📃[Back to Table of Content](#table-of-content)

# Order of Precedence
If no additional options are given to *semantix* then the default values will be used. Otherwise, values will be read from the the command line `--options` first and the missing variables filled in with the `.semantix.yml` configuration file.  

It is recommended to use `.semantix.yml` for all your configuration and only use the command line `--options` as overrides.


# Configuration
> You may store your configuration and override some defaults in a `.semantix.yml` file
## *`.semantix.yml`*
```yml
branch: master
release:
    BREAKING: major
    feat: minor
    perf: minor
    refactor: minor
    ci: patch
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

📃[Back to Table of Content](#table-of-content)

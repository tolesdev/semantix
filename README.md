# 🌠semantix
> *Semantix is a tool that analyzes your repository's commit history and generates the appropriate semantic version based off keywords found in the commit messages*
### Table of Content
- [🚀 Installation](#installation)
- [🔨 Usage](#usage)
    - [📦 package.json](#packagejson)
    - [⌨ Command Line](#command-line)
        - [🛠 Commands](#commands)
        - [⚙ Options](#options)
- [📂 Configuration](#configuration)
# Installation
```
npm install --save semantix
```
📃[Back to table of content](#table-of-content)
# Usage
> *NOTE: Javascript API will be coming in a later version*
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
|*latest*|Returns the version of the latest release|
|*next*|Returns the next release version|
|*update*|Updates the package.json with the next release version|

### Options
|Option|Alias|Description|
|:----:|:-----:|:---|
|*--branch*|*-b*|Specify the branch from which to release|
|*--repository*|*-r*|Specify the repository to be considered during the release process. If omitted, **semantix** will use repository specified in *package.json*|

📃[Back to table of content](#table-of-content)
# Configuration
> *You may store your configuration and override some defaults in a `semantix.yml` file*

## `semantix.yml`
*Values shown below are the **semantix** defaults*
```yml
release:
    BREAKING: major
    feat: minor
    perf: minor
    init: patch
    chore: patch
    fix: patch
    test: patch
    docs: patch
branch: master
```
|Key|Type|Description|Default
|---|----|----|:---:|
|`release`|object|Mapping of keywords to semantic version increment amounts|*See above*
|`branch`|string|The branch to be considered for releases|master
📃[Back to table of content](#table-of-content)
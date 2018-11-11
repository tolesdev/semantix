# semantix
## 🌠 Introduction
Semantix is a tool that analyzes your repository's commit history and generates the appropriate semantic version based off keywords found in the commit message.
## 🚀 Installation
```sh
npm install -g semantix
```
## 🔨 Usage
```sh
semantix <command> [--repsoitory] [--branch]
```
### *current*
Returns the version of the latest release.
### *next*
Returns the next release version.
### *update*
Updates the package.json with the next release version.
### --*repository*, -*r*
Specify the repository to be considered during the release process.

### --*branch*, -*b*
Specify the branch from which to release.
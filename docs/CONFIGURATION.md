# semantix
## *semantix.config.js*
### **release**
*Override the release mapping. Specify keywords that relate to semantic version increments -- ***keyword*** can contain any character except spaces..*
```js
release: {
    keyword: "major|minor|patch"
}
```
Example of the default mapping below.
```js
release: {
    BREAKING: "major",
    feat: "minor",
    perf: "minor",
    init: "patch",
    chore: "patch",
    fix: "patch",
    test: "patch",
    docs: "patch"
}
```
### **extend**
*An alternative to **release**, extends the default release mapping.*
```js
extend: {
    keyword: "major|minor|patch"
}
```

### **branch**
*Specify the branch from which to release.*
```js
branch: "master"
```

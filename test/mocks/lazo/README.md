# Lazo Mocks
These mocks are used to unit test Lazo applications. Please do not modify these objects unless the
changes are of use to **_all_** Lazo applications. Any application specific overrides should be done in the
application repo **_NOT_** here.

### Usage
These are intended to be used with [grunt-castle](https://gecgithub01.walmart.com/jstrimp/grunt-castle)
([castle example](https://gecgithub01.walmart.com/jstrimp/castle-example)). Grunt-castle is what is used to unit
test Lazo. These mocks should be pulled down and merged with an application's mocks.

#### Step 1
Add the mocks as a dev dependency to your Lazo application package.json.

```javascript
"devDependencies": {
    "lazo-mocks": "git+https://gecgithub01.walmart.com:platform/lazo-mocks.git"
}
```

OR install from the command line within the application's directory.

```shell
npm install git+ssh://git@gecgithub01.walmart.com:platform/lazo-mocks.git
```

#### Step 2
Create a grunt task that merges these mocks with your application mocks.

```javascript
grunt.registerTask('merge-mocks', 'Merge lazo mocks.', function () {
    var dst = grunt.config.get('castle').TARGET_NAME_GOES_HERE.options.mocks.baseUrl,
        src = './node_modules/lazo-mocks';

    function copyMocks(src, dst) {
        fs.readdirSync(src).forEach(function (mock) {
            if (path.extname(mock) === '.js') {
                grunt.file.copy(path.normalize(src + '/' + mock), path.normalize(dst + '/' + mock));
            } else if (grunt.file.isDir(src + '/' + mock)) {
                copyMocks(src + '/' + mock, dst + '/' + mock);
            }
        });
    }

    copyMocks(src, dst);
});
```
module.exports = function () {
    var path = require('path');
    var fs = require('fs');
    var lazoPath = path.dirname(module.filename);
    var packageJson = JSON.parse(fs.readFileSync(path.normalize(lazoPath + '/package.json'), 'utf8'));
    return 'v' + packageJson.version;
}
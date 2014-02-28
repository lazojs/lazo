var fs = require('fs');
var path = require('path');

['backbone', 'jquery', 'underscore', 'requirejs'].forEach(function (moduleId) {
    var modulePath = require.resolve(moduleId);
    if (moduleId === 'requirejs') {
        // resolve to node_modules/requirejs/bin/r.js; pop off file name and last dir
        // and append the browser lib
        modulePath = path.dirname(path.dirname(modulePath)) + '/require.js';
    }

    fs.writeFileSync('lib/vendor/' + moduleId + '.js', fs.readFileSync(modulePath));
});
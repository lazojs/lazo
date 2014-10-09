define(['module'], function (mod) {

    'use strict';

    var path = require('path');

    function isClientOnly(name, paths) {
        var names = name.indexOf('/') ? name.split('/') : [name];
        for (var i = 0; i < names.length; i++) {
            if (paths[names[i]] && paths[names[i]].indexOf('/client/') !== -1) {
                return true;
            }
        }

        return false;
    }

    function resolvePath(baseUrl, relativePath) {
        // requirejs adds a "/" to the end of the baseUrl regardless of the OS
        baseUrl = baseUrl.substr(0, baseUrl.length - 1) + path.sep;
        return path.normalize(baseUrl + relativePath);
    }

    return {
        load: function (name, req, onload, config) {
            var nodeModule;
            var modulePath;

            //req has the same API as require().
            if (name !== null && name.indexOf('/client/') === -1 && !isClientOnly(name, config.paths)) {
//                console.log(name);


                req([name], function (value) {
                    onload(value);
                }, function (err) {
                    // try to load node module using absolute path
                    modulePath = resolvePath(config.baseUrl, name);

                    try {
                        nodeModule = require.nodeRequire(modulePath);

                        onload(nodeModule);
                    } catch (e) {
                        // try injecting node_modules directory
                        modulePath = modulePath.substr(0, modulePath.lastIndexOf(path.sep)) + path.sep + 'node_modules' +
                            modulePath.substr(modulePath.lastIndexOf(path.sep));
                        nodeModule = require.nodeRequire(modulePath);
                        onload(nodeModule);
                    }
                });

            } else {
                //Returning null for client side dependencies on server
                onload(null);
            }
        }
    };

});

define(['module'], function (mod) {

    'use strict';

    function isClientOnly(name, paths) {
        var names = name.indexOf('/') ? name.split('/') : [name];
        for (var i = 0; i < names.length; i++) {
            if (paths[names[i]] && paths[names[i]].indexOf('/client/') !== -1) {
                return true;
            }
        }

        return false;
    }

    return {
        load: function (name, req, onload, config) {
            var nodeModule;
            var modulePath;

            //req has the same API as require().
            if (name !== null && name.indexOf('/client/') === -1 && !isClientOnly(name, config.paths)) {

                req([name], function (value) {
                    onload(value);
                }, function (err) {
                    // try to load node module using absolute path
                    modulePath = config.baseUrl + name;

                    try {
                        nodeModule = require.nodeRequire(modulePath);
                        onload(nodeModule);
                    } catch (e) {
                        // try injecting node_modules directory
                        name = name.substr(0, name.lastIndexOf('/')) + '/node_modules' + name.substr(name.lastIndexOf('/'));
                        modulePath = config.baseUrl + name;
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

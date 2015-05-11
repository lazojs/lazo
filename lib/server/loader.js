define(['module'], function (mod) {

    'use strict';

    var path = require('path');

    var paths = [];

    paths.push(LAZO.FILE_REPO_PATH);
    paths.push(LAZO.FILE_REPO_PATH + path.sep + 'node_modules');
    paths.push(process.cwd() + path.sep + 'node_modules');
    paths.push(LAZO.BASE_PATH + path.sep + 'node_modules');

    function isClientOnly(name, paths) {
        var names = name.indexOf('/') ? name.split('/') : [name];
        for (var i = 0; i < names.length; i++) {
            if (paths[names[i]] && paths[names[i]].indexOf('/client/') !== -1) {
                return true;
            }
        }

        // path is not defined for the server; assume client only defined path
        return names.length === 1 && !paths[names[0]] ? true : false;
    }

    function resolvePath(baseUrl, relativePath) {
        // requirejs adds a "/" to the end of the baseUrl regardless of the OS
        baseUrl = baseUrl.substr(0, baseUrl.length - 1) + path.sep;
        return path.normalize(baseUrl + relativePath);
    }

    function logInfo(modulePath) {
        if (LAZO && LAZO.logger && LAZO.logger.info) {
            LAZO.logger.info(['server.loader'], 'Tried loading module from path %s', modulePath);
        } else {
            console.info('[server.loader] ' + modulePath);
        }
    }
    
    function logError(err) {
        if (LAZO && LAZO.logger && LAZO.logger.error) {
            LAZO.logger.error(['server.loader'], '%s', err);
        } else {
            console.error('[server.loader] ' + err);
        }
    }

    function injectNodeModules(modulePath) {
        var parts = modulePath.split(path.sep);
        var partsLength = parts.length;
        var isPrivate = partsLength > 2 && /^@/.test(parts[partsLength - 2]);
        var offset = isPrivate ? 2 : 1;

        parts.splice(partsLength - offset, 0, 'node_modules');

        return parts.join(path.sep);
    }

    return {
        load: function (name, req, onload, config) {
            var nodeModule;
            var modulePath;
            var loaded = true;

            //req has the same API as require().
            if (name !== null && name.indexOf('/client/') === -1 && !isClientOnly(name, config.paths)) {
                req([name], function (value) {
                    onload(value);
                }, function (err) {
                    // try to load node module using absolute path
                    modulePath = resolvePath(config.baseUrl, name);

                    try {
                        nodeModule = require.nodeRequire(modulePath);
                        onload(nodeModule);
                    } catch (err) {
                        loaded = false;
                        logInfo(modulePath);
                        try {
                            loaded = true;
                            // try injecting node_modules directory
                            nodeModule = require.nodeRequire(injectNodeModules(modulePath));
                            onload(nodeModule);
                        } catch (err) {
                            loaded = false;
                            logInfo(modulePath);
                        }
                    }

                    // try other common paths
                    for (var i = 0; i < paths.length; i++) {
                        if (loaded) {
                            break;
                        }

                        for (var j = 0; j < 2; j++) {
                            try {
                                loaded = true;
                                modulePath = paths[i] + path.sep + name;
                                nodeModule = require.nodeRequire(j ? injectNodeModules(modulePath) : modulePath);
                            } catch (err) {
                                logInfo(modulePath);
                                loaded = false;
                            }
                        }
                    }
                    
                    if(!loaded){
                        logError(err);
                    }
                });
            } else {
                //Returning null for client side dependencies on server
                onload(null);
            }
        }
    };

});
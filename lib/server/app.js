var scan = require('./scanner');

scan(process.env.FILE_REPO_DIR, function (appFiles) {
    var fs = require('fs');
    var path = require('path');
    var requirejs = require('requirejs');
    var logger = require('./logger');
    var http = require('http');
    var bootstrap;
    var appJSON = fs.readFileSync(path.normalize(process.env.FILE_REPO_DIR + '/app/app.json'));
    var routes = {};

    try {
        appJSON = JSON.parse(appJSON);
        routes = appJSON.routes;
    } catch (e) {
        console.log('Error reading app/routes.json: ' + e);
        process.exit(code=0);
    }

    var conf = (function() {
        var conf = JSON.parse(fs.readFileSync('conf.json'));

        var appConfPath = path.normalize(process.env.FILE_REPO_DIR + '/conf.json');
        var appConf = fs.existsSync(appConfPath) ? fs.readFileSync(appConfPath) : null;

        if (appConf) {
            try {
                appConf = JSON.parse(appConf);
            } catch (e) {
                console.log('Error reading conf.json: ' + e);
                process.exit(code=0);
            }

            for (var k in appConf) {
                if (conf[k]) {
                    for (var j in appConf[k]) {
                        conf[k][j] = appConf[k][j];
                    }
                }
            }
        }

        return conf;
    })();

    global.LAZO = {
        logger: logger,
        BASE_PATH: process.env.BASE_PATH,
        FILE_REPO_DIR: process.env.FILE_REPO_DIR,
        SHARED_REPO_DIR: process.env.SHARED_REPO_DIR,
        FILE_REPO_PATH: path.resolve(process.env.FILE_REPO_DIR),
        PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : conf.server.port,
        CLUSTER: process.env.CLUSTER === '1',
        ROBUST: process.env.ROBUST === '1',
        conf: conf,
        routes: routes,
        files: appFiles
    };

    bootstrap = requirejs.config({
        baseUrl: LAZO.BASE_PATH,
        context: 'bootstrap',
        paths: {
            'json': 'lib/vendor/json',
            'text': 'lib/vendor/text',
            'common': 'lib/common',
            'base': 'lib/common/base',
            'resolver': 'lib/common/resolver'
        }
    });

    // load requireConfigure directly as opposed to resolver/main because resolver
    // sub modules have need requirejs to be configured prior to being loaded
    bootstrap(['resolver/requireConfigure'], function (requireConfigure) {

        'use strict';

        var options = {
            basePath: LAZO.BASE_PATH,
            baseUrl: LAZO.FILE_REPO_DIR,
            paths: conf.requirejs.paths,
            shim: conf.requirejs.shim
        };

        requireConfigure.get('server', options, function (err, conf) {
            if (err) {
                throw new Error(err);
            }
            var serverConf = conf;

            requireConfigure.get('client', options, function (err, conf) {
                if (err) {
                    throw new Error(err);
                }
                var clientConf = conf;

                function addPaths(serverConf) {
                    var customBundlerPath = path.normalize(LAZO.FILE_REPO_DIR + '/app/bundle.js');
                    if (fs.existsSync(customBundlerPath)) {
                        serverConf.paths.bundler = path.resolve(path.normalize(LAZO.FILE_REPO_DIR + '/app/bundle')); // use absolute path
                    }

                    return serverConf;
                }

                LAZO.require = requirejs.config(addPaths(serverConf));
                LAZO.contexts = {
                    request: JSON.parse(JSON.stringify(clientConf)), // request combo handling
                    lib: JSON.parse(JSON.stringify(clientConf)), // lib combo handling
                    server: JSON.parse(JSON.stringify(serverConf)), // paths are used for generating combo handled file
                    app: {
                        shim: conf.shim,
                        paths: conf.paths
                    }
                };

                // these are needed by dependencies of lazoApp
                LAZO.isServer = true;
                LAZO.isClient = false;
                // these cannot be loaded until the requirejs app config has been set
                LAZO.require(['app/application', 'config'], function (LazoApp, config) {
                    LAZO.app = new LazoApp();
                    LAZO.app.isServer = LAZO.isServer;
                    LAZO.app.isClient = LAZO.isClient;
                    LAZO.app.css = appJSON.css || [];
                    LAZO.app.js = appJSON.js || [];

                    LAZO.config = config;

                    // these are dependent on the
                    LAZO.require(['server', 'resolver/file', 'error'], function (server, file, err) {

                        LAZO.error = err;

                        // process appArgs command line argument into application.args
                        var args = process.argv.filter(function (elem) {
                            return elem.indexOf('--appArgs') !== -1;
                        });
                        if (args.length) {
                            LAZO.app.args = {};
                            var appArgs = args[0].split('='),
                                args = appArgs[1].split(';');
                            for (var i = 0, il = args.length; i < il; i++) {
                                var arg = args[i].split(':');
                                LAZO.app.args[arg[0]] = arg[1];
                            }
                        }

                        LAZO.logger.warn(['server.app'], 'Initializing with arguments: %j', LAZO.app.args);

                        // TODO: move to conf.json
                        // read in ssl server config
                        try {
                            LAZO.options = JSON.parse(fs.readFileSync(path.resolve(path.normalize(LAZO.FILE_REPO_DIR + '/config/serverConfig.json'))));
                        } catch (error) {
                            LAZO.options = {};
                            LAZO.logger.warn(['server.app'], 'Failed to load serverConfig.json', error);
                        }

                        // TODO: move to conf.json
                        // manually setup server config, TODO: should be refactored to be read in from serverConfig.json
                        LAZO.options.server = {
                            port: LAZO.PORT,
                            maxSockets: LAZO.conf.server.maxSockets
                        };

                        LAZO.logger.warn(['server.app'], 'Initializing with options: %j', LAZO.options);

                        http.globalAgent.maxSockets = LAZO.options.server.maxSockets;

                        LAZO.app.initialize(function () {
                            // var bundles = 0,
                            //     bundleConf;

                            LAZO.app.js = LAZO.app.js || [];
                            file.getErrorTemplatePaths(function (err, errHandlers) {
                                if (err) {
                                    throw err;
                                }

                                LAZO.errorTemplates = errHandlers;
                                server.initialize(errHandlers);
                            });
                        });
                    });
                });
            });
        });

    });
});
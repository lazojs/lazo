define([
    'handlers/app/main',
    'handlers/assets',
    'continuation-local-storage',
    'cluster',
    'fs',
    'hapi',
    'path',
    'resolver/main',
    'handlers/safe',
    'handlers/stream',
    'handlers/tunnel',
    'lodash',
    'forbidden'
], function (appHandler, assetsHandler, cls, cluster, fs, hapi, path, resolver, safeHandler, streamHandler, tunnelHandler, _, forbidden) {

    'use strict';

    var lazoNs = cls.createNamespace('lazojs');

    return {

        initialize: function (errHandlers, cb) {
            LAZO.logger.warn(['server.initialize'], 'Initializing server...');

            this.errHandlers = errHandlers;
            this.cb = cb;
            this._cluster(); // cluster server if !this.DEV
        },

        _servers: {},

        _worker: function () {
            var self = this;

            this._create(function () {
                self._extensions() // server extensions
                ._routes() // define app routes and add app handlers
                ._handlers() // add all other route handlers
                ._error() // init logger & error handling
                ._start();
            });
        },

        _create: function (callback) {
            var servers = LAZO.conf.server.instances;
            var serverDefaults = LAZO.conf.server.defaults;
            var self = this;
            var options;
            var port;

            function getSslCerts(tls) {
                for (var k in tls) {
                    try {
                        tls[k] = fs.readFileSync(path.resolve(LAZO.FILE_REPO_DIR + '/' + tls[k]));
                    } catch (e) {
                        throw new Error('could not find ssl ' + k + ' at ' + tls[k]);
                    }
                }
            }

            // TODO: move monitoring here
            this.pack = new hapi.Pack();
            LAZO._servers = {};
            for (var k in servers) {
                options = _.merge({ labels: [k] }, servers[k], serverDefaults);
                port = options.port;
                options = _.omit(options, ['port', 'monitor', 'maxBytes']);
                options.views = {
                    engines: {
                        hbs: {
                            module: require('handlebars')
                        }
                    },
                    allowAbsolutePaths: true
                };
                options.maxSockets = LAZO.conf.server.maxSockets;

                if (options.tls) {
                    getSslCerts(options.tls);
                }

                // TODO: remove the private servers property and expose monitoring
                LAZO._servers[k] = this._servers[k] = this.pack.server(port, options);
                console.log('Lazo started on port ' + port);
            }

            if (LAZO.conf.server.monitor.on) {
                this.pack.register({
                    plugin: require('good'),
                    options: LAZO.conf.server.monitor.options
                }, function (err) {
                    if (err) {
                        LAZO.logger.error('[server._create]', 'Error initializing monitoring: ' + err);
                        return callback();
                    } else {
                        LAZO.monitor = self.pack.plugins.good.monitor;
                        callback();
                    }
                });
            } else {
                callback();
            }
        },

        _extensions: function () {
            var self = this;

            function preResponseHandler (request, reply) {
                var response = request.response;

                if (forbidden(request.url.path)) {
                    return reply(hapi.error.forbidden());
                } else if (response.isBoom) {
                    if (LAZO.CLUSTER && !LAZO.ROBUST && response.output.statusCode >= 500 && response.output.statusCode <= 599) {
                        LAZO.logger.error('[server._extensions]', 'Internal server error', request.url.href, response.response.code, response.message, response.trace);
                        self._stop();
                    }

                    // TODO: probably don't need this since we no longer AJAX on client app.navigate
                    if (request.raw.req.headers['x-requested-with'] !== 'XMLHttpRequest') {
                        var errHandler = self.errHandlers[response.output.statusCode];
                        if (errHandler) {
                            return reply.view(errHandler.server, response.output.payload);
                        }
                    }
                }

                return reply();
            }

            function onRequest(request, next) {
                lazoNs.run(function () {
                    lazoNs.set('request', request);
                    process.nextTick(function () {
                        next();
                    });
                });
            }

            for (var k in this._servers) {
                this._servers[k].ext('onPreResponse', preResponseHandler);
                this._servers[k].ext('onRequest', onRequest);
            }

            return this;
        },

        _routes: function () {
            var self = this;
            var routeDefs = LAZO.routes;
            var serverRoutDefs;
            var s;
            var r;

            // TODO: do we still need to handle POST request for routes?
            function processRoute(route, tags) {
                var routes = resolver.transformRoute(route);

                if (routes.routeNoTrailingSlash) {
                    self._addAppRouteHandler('GET', routes.routeNoTrailingSlash, route, tags);
                    self._addAppRouteHandler('POST', routes.routeNoTrailingSlash, route, tags);
                }

                self._addAppRouteHandler('GET', routes.route, route, tags);
                self._addAppRouteHandler('POST', routes.route, route, tags);
            }

            // add default server tag if it does not exist
            function setTags(routeDefs) {
                var i = 0;

                for (var k in routeDefs) {
                    if (_.isObject(routeDefs[k])) {
                        if (!_.isArray(routeDefs[k].servers)) {
                            routeDefs[k].servers = ['primary'];
                        }
                    } else {
                        routeDefs[k] = {
                            component: routeDefs[k],
                            servers: ['primary']
                        };
                    }
                }

                return routeDefs;
            }

            serverRoutDefs = setTags(routeDefs);
            for (r in serverRoutDefs) {
                processRoute(r, serverRoutDefs[r].servers);
            }
            for (s in this._servers) {
                // give server a reference to routes, used later when handling the routes
                this._servers[s]._routes = serverRoutDefs;
            }

            return this;
        },

        _addAppRouteHandler: function (method, path, route, tags) {
            var self = this,
                definition = { method: method, path: path };

            if (method === 'GET') {
                definition.config = {
                    tags: tags,
                    handler: function (request, reply) {
                        appHandler(request, reply, route);
                    }
                };
            } else {
                definition.config = {
                    tags: tags,
                    handler: function (request, reply) {
                        appHandler(request, reply, route);
                    },
                    payload: { parse: true }
                };
            }

            this._setServerRoute(definition);

            return this;
        },

        _handlers: function () {
            this._tunnelHandler()
                ._assetsHandler()
                ._staticFilesHandler();

            return this;
        },

        _tunnelHandler: function () {
            var tunnelOptions = {
                method: 'POST',
                path: '/tunnel/{extras*}',
                config: {
                    handler: tunnelHandler,
                    payload: { parse: true }
                }
            };

            this._setServerRoute(tunnelOptions);

            var postFcaOptions = {
                method: 'POST',
                path: '/fn/{compName}/{action}',
                config: {
                    handler: streamHandler,
                    payload: { parse: true }
                }
            };

            this._setServerRoute(postFcaOptions);

            var postFaOptions = {
                method: 'POST',
                path: '/fn/{action}',
                config: {
                    handler: streamHandler,
                    payload: { parse: true }
                }
            };

            this._setServerRoute(postFaOptions);

            var getFcaOptions = {
                method: 'GET',
                path: '/fn/{compName}/{action}',
                config: {
                    handler: streamHandler
                }
            };

            this._setServerRoute(getFcaOptions);

            var getFaOptions = {
                method: 'GET',
                path: '/fn/{action}',
                config: {
                    handler: streamHandler
                }
            };

            this._setServerRoute(getFaOptions);

            return this;
        },

        _assetsHandler: function () {
            var assetOptions = {
                method: 'GET',
                path: '/assets',
                handler: assetsHandler
            };

            this._setServerRoute(assetOptions);

            return this;
        },

        _staticFilesHandler: function () {
            var pathsOptions = {
                method: 'GET',
                path: '/{path*}',
                handler: {
                    directory: {
                        path: [
                            LAZO.FILE_REPO_DIR,
                            LAZO.BASE_PATH,
                            LAZO.BASE_PATH + '/lib'
                        ],
                        listing: false,
                        index: true
                    }
                }
            };

            this._setServerRoute(pathsOptions);

            var libOptions = {
                method: 'GET',
                path: '/lib/{path*}',
                handler: {
                    directory: { path: [LAZO.BASE_PATH + '/lib'], listing: true, index: true }
                }
            };

            this._setServerRoute(libOptions);

            var baseOptions = {
                method: 'GET',
                path: '/base/{path*}',
                handler: {
                    directory: { path: [LAZO.BASE_PATH + '/base'], listing: true, index: true }
                }
            };

            this._setServerRoute(baseOptions);

            return this;
        },

        _error: function () {
            var ev;

            for (var k in this._servers) {
                ev = this._servers[k].on ? this._servers[k] : this._servers[k].events;
                ev.on('internalError', function (request, error) {
                    LAZO.logger.debug('[server._error]', 'Internal server error', request, error);
                });
            }

            return this;
        },

        _start: function () {
            var self = this;

            this.pack.register({
                plugin: require('crumb'),
                options: { ext: true }
            }, function (err) {
                if (!err) {
                    self.pack.start();
                    self.cb();
                } else {
                    LAZO.logger.error('[server._start]', 'Error while starting %s server...', k, err);
                }
            });

            return this;
        },

        _stop: function () {
            var self = this;

            try {
                if (cluster.isWorker) {
                    cluster.worker.disconnect();
                }

                this.pack.stop(function () {
                    process.exit(1);
                });
            } catch (err) {
                LAZO.logger.error('[server._stop]', 'Error while stopping server and disconnecting worker.', err);
            }
        },

        _cluster: function () {
            var cpus;
            var k;
            var port;

            if (!LAZO.CLUSTER) {
                this._worker();
                for (k in this._servers) {
                    port = LAZO.conf.server.instances[k].port || LAZO.conf.server.defaults.port;
                    LAZO.logger.warn('[server._cluster]', 'Server %s started with single process, listening on port %d...', port, k);
                }

                return this;
            }

            cpus = process.env['CLUSTER'];

            if (cluster.isMaster) {
                for (var i = 0; i < cpus; i++) {
                    cluster.fork();
                }

                cluster.on('online', function (worker) {
                    LAZO.logger.warn('[server._cluster]', 'Worker %d:%d is online.', worker.id, worker.process.pid);
                });

                cluster.on('disconnect', function (worker) {
                    LAZO.logger.warn('[server._cluster]', 'Worker %d:%d was disconnected.', worker.id,
                        worker.process.pid);
                    cluster.fork();
                });
            } else {
                this._worker();
                for (k in this._servers) {
                    port = LAZO.conf.server.instances[k].port || LAZO.conf.server.defaults.port;
                    LAZO.logger.warn('[server._cluster]', 'Server %s started with %d workers, listening on port %d...', k, cpus, port);
                }
            }

            return this;
        },

        _setServerRoute: function (options) {
            var self = this;

            for (var k in this._servers) {
                // check for server name in application route tags
                // if server name is not in tags then do not add route
                if (options.config && options.config.tags &&
                    !_.find(options.config.tags, function (tag) {
                        return tag === k;
                    })) {
                    continue;
                }

                if (LAZO.ROBUST && typeof options.handler === 'function') {
                    options.handler = safeHandler(this._servers[k], options.handler, self);
                }

                this._servers[k].route(options);
            }
        }

    };

});
define(['jquery', 'underscore', 'backbone', 'lazoCtl', 'viewManager', 'assetsProvider', 'async', 'hermes', 'rehydrate/main', 'execute', 'lib/client/state', 'lib/client/prime'],
    function ($, _, Backbone, LazoCtl, viewManager, AssetsProvider, async, hermes, rehydrate, execute, state, prime) {

    'use strict';

    LAZO.app._getModules = function (rootCtx) {
            var modules = rootCtx.dependencies.modules ? rootCtx.dependencies.modules : rootCtx.modules,
            wait = rootCtx.dependencies.modules ? true : false;

        return {
            modules: modules,
            wait : wait
        };
    };

    return {

        initialize: function (options) {
            LAZO.logger.debug('[client.app.initialize] Initializing client...', options);
            LAZO.app.assets.setPlugin(new LAZO.app.assets.DefaultPlugin({ provider: new AssetsProvider() }));

            var self = this,
            modules = LAZO.app._getModules(LAZO.initConf.rootCtx);

            this.currentLayout = LAZO.initConf.layout;

            // if window.rootCtx.dependencies.modules then combo handled and we need to wait on response
            // else prefetch modules so that they are loading in parallel while rehydrate runs
            if (modules.wait) { // bundles loaded by boostrap.js
                return self._initialize(options);
            }
            prime(modules.modules, 'js', modules.wait, function (err) {
                if (err) {
                    return; // TODO: throw error
                }

                self._initialize(options);
            });
        },

        _initialize: function () {
            this._clickHandler();
            this._defineRoutes();
            hermes.start({
                state: state.createStateObj(LAZO.initConf.rootCtx),
                cache: true,
                routeNotMatched: function (routePathName) {
                    LAZO.error.render({ statusCode: 404, error: 'Not found', message: 'This is not the page you are looking for.' });
                }
            });

            LAZO.app.trigger('application:initialize');
            LAZO.files = LAZO.initConf.files;
            rehydrate(LAZO.initConf.rootCtl, LAZO.initConf.rootCtx, function (ctl) {
                LAZO.ctl = ctl;
                LAZO.layout = LAZO.initConf.layout;
                viewManager.attachViews(ctl);
                LAZO.app.trigger('application:ready');
                delete LAZO.initConf;
            });
        },

        _clickHandler: function () {
            $('body').on('click', '[lazo-navigate]', function (e) {
                var $currentTarget = $(e.currentTarget),
                    href = $currentTarget.attr('lazo-navigate') || $currentTarget.attr('href');
                if (href) {
                    e.preventDefault();
                    LAZO.app.navigate(null, href);
                }
            });
        },

        _defineRoutes: function () {
            var self = this;

            LAZO.router = hermes;
            _.each(LAZO.routes, function (value, path) {
                hermes.route(path, path, function (pathname, params, state) {
                    var eventData = {
                        route: path,
                        pathname: pathname,
                        parameters: _.extend(params, state.parameters)
                    };

                    LAZO.app.trigger('navigate:application:begin', eventData);
                    execute(eventData); // pass event data, so that other nav events can pick it up
                });
            });
        }

    };

});
define(['underscore', 'utils/loader', 'context', 'resolver/component'], function (_, loader, Context, cmpResolver) {

    'use strict';

    return {

        getCookies: function (request) {
            var cookies = {},
                state;
            if (!(state = request.state)) {
                return cookies;
            }

            for (var key in state) {
                cookies[key] = decodeURIComponent(state[key]);
            }

            return cookies;
        },

        getAssets: function (cmpName, ctx, options) {
            if (!_.isEmpty(ctx._assets)) {
                var map = ctx._assets;
                delete ctx._assets;
                return options.success(map);
            }

            if (LAZO.app.isClient) {
                return options.success(window.rootCtx ? window.rootCtx.assets : {});
            }

            LAZO.app.assets.map(cmpName, ctx, {
                success: options.success,
                error: options.error
            });
        },

        setAssets: function (component, assets) {
            var self = this;

            component.ctx.assets = component.ctx.assets || {};
            _.extend(component.ctx.assets, assets[component.name]);

            component.ctx.app = component.ctx.app || {};
            component.ctx.app.assets = component.ctx.app.assets || {};
            _.extend(component.ctx.app.assets, assets.app);

            _.each(component.children, function (children) {
                _.each(children, function (child) {
                    self.setAssets(child, assets);
                });
            });
        },

        getRootCtxForReply: function (ctx, assets) {
            return _.extend(_.omit(ctx._rootCtx, 'modelInstances'), {
                dependencies: ctx._rootCtx.dependencies,
                assets: assets,
                modelInstances: {}
            });
        },

        getDef: function (route) {
            return cmpResolver.getDef(route);
        },

        createCtx: function (options) {
            return new Context(options);
        },

        process: function (options) {
            var self = this;
            var cmpDef = options.def;
            var ctx = options.ctx;
            var hasLayoutChanged = cmpDef.layout && cmpDef.layout !== LAZO.layout;
            var cmpToLoad = cmpDef.layout || cmpDef.name;

            function onError(err) {
                return options.error(err);
            }

            loader(cmpToLoad, {
                ctx: ctx,
                // TODO: optimize layout rendering
                action: (cmpToLoad === cmpDef.layout && LAZO.layout !== cmpDef.layout) ? 'index' : cmpDef.action,
                error: onError,
                success: function (ctl) {
                    if (cmpDef.layout) {
                        ctl.addChild('lazo-layout-body', cmpDef.name, {
                            params: ctx.params,
                            action: cmpDef.action,
                            success: function () {
                                return self.getAssets(cmpDef.name, ctx, {
                                    success: function (assets) {
                                        self.setAssets(ctl, assets);
                                        options.success(ctl, ctx, assets, cmpDef, options);
                                    },
                                    error: onError
                                });
                            },
                            error: onError
                        });
                    } else {
                        return self.getAssets(cmpDef.name, ctx, {
                            success: function (assets) {
                                self.setAssets(ctl, assets);
                                options.success(ctl, ctx, assets, cmpDef, options);
                            },
                            error: onError
                        });
                    }
                }
            });
        }

    };

});
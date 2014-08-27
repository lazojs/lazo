define(['underscore', 'utils/loader', 'context', 'resolver/component'], function (_, loader, Context, cmpResolver) {

    'use strict';

    return {

        getAssets: function (cmpName, ctl, ctx, options) {
            var componentsList = this.getComponents(ctl, []);
            var len = componentsList.length;
            var processed = 0;
            var componentNames = [];
            var assets = {};
            var componentsHash = {};

            for (var i = 0; i < len; i++) {
                componentsHash[componentsList[i].name] = componentsList[i];
                componentNames.push(componentsList[i].name);
            }

            if (!LAZO.app.assets.getPlugin()) {
                for (var k in componentsHash) {
                    componentsHash[k].ctx.assets = { app: {} };
                    assets[k] = { app: {} };
                }

                return options.success(assets);
            }

            LAZO.app.assets.map(componentNames, ctx, {
                success: function (results) {
                    for (var k in results) {
                        if (k !== 'app') {
                            componentsHash[k].ctx.assets = results[k];
                            componentsHash[k].ctx.assets.app = results.app || {};
                            assets[k] = componentsHash[k].ctx.assets;
                        }
                    }

                    options.success(assets);
                },
                error: options.error
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

        getComponents: function (ctl, list) {
            list.push(ctl);

            if (_.size(ctl.children)) {
                for (var k in ctl.children) {
                    for (var i = 0; i < ctl.children[k].length; i++) {
                        this.getComponents(ctl.children[k][i], list);
                    }
                }
            }

            return list;
        },

        getComponentNames: function (ctl) {
            return _.map(this.getComponents(ctl, []), function (ctl) {
                return ctl.name;
            });
        },

        process: function (options) {
            var self = this;
            var cmpDef = options.def;
            var ctx = options.ctx;
            var hasLayoutChanged = !cmpDef.layout || (cmpDef.layout !== LAZO.layout) ? true : false;
            var cmpToLoad = (hasLayoutChanged && cmpDef.layout) ? cmpDef.layout : cmpDef.name;
            var layoutCtl;

            function onError(err) {
                return options.error(err);
            }

            if (LAZO.isClient && !hasLayoutChanged && cmpDef.layout) {
                return LAZO.ctl.addChild('lazo-layout-body', cmpDef.name, {
                    params: ctx.params,
                    action: cmpDef.action,
                    success: function (ctl) {
                        return self.getAssets(cmpDef.name, ctl, ctx, {
                            success: function (assets) {
                                options.success(ctl, ctx, assets, cmpDef, options);
                            },
                            error: onError
                        });
                    },
                    error: onError
                });
            }

            loader(cmpToLoad, {
                ctx: ctx,
                action: hasLayoutChanged && cmpDef.layout ? 'index' : cmpDef.action,
                error: onError,
                success: function (ctl) {
                    if (cmpDef.layout) {
                        ctl.addChild('lazo-layout-body', cmpDef.name, {
                            params: ctx.params,
                            action: cmpDef.action,
                            success: function () {
                                return self.getAssets(cmpDef.name, ctl, ctx, {
                                    success: function (assets) {
                                        options.success(ctl, ctx, assets, cmpDef, options);
                                    },
                                    error: onError
                                });
                            },
                            error: onError
                        });
                    } else {
                        return self.getAssets(cmpDef.name, ctl, ctx, {
                            success: function (assets) {
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
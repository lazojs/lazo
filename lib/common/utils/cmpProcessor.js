define(['underscore', 'utils/loader', 'context', 'resolver/component'], function (_, loader, Context, cmpResolver) {

    'use strict';

    return {

        getAssets: function (cmpName, ctl, ctx, options) {
            var components = this.getComponents(ctl, []);
            var len = components.length;
            var processed = 0;

            for (var i = 0; i < len; i++) {
                (function (i) {
                    LAZO.app.assets.map(components[i].name, ctx, {
                        success: function (assets) {
                            processed++;
                            if (len === processed) {
                                options.success(assets);
                            }
                        },
                        error: options.error
                    });
                })(i);
            }
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
                                self.setAssets(ctl, assets);
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
                                        self.setAssets(ctl, assets);
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
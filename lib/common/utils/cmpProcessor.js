define(['underscore', 'utils/loader', 'context', 'resolver/component', 'utils/assetsMixin'],
    function (_, loader, Context, cmpResolver, assetsMixin) {

    'use strict';

    return _.extend({

        getRootCtxForReply: function (ctx, ctl) {
            var components = this.getComponents(ctl, []);
            var assets = {};
            var i = components.length;

            while (i--) {
                assets[components[i].name] = components[i].ctx.assets;
            }

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

            function onError(err) {
                return options.error(err);
            }

            if (LAZO.isClient && !hasLayoutChanged && cmpDef.layout) {
                return LAZO.ctl.addChild('lazo-layout-body', cmpDef.name, {
                    ctx: {
                        params: ctx.params
                    },
                    action: cmpDef.action,
                    success: function (ctl) {
                        options.success(ctl, ctx, cmpDef, options);
                    },
                    error: onError
                });
            }

            this.getAssets(cmpDef.name, ctx, {
                success: function (assets) {
                    ctx.assets = assets;
                    loader(cmpToLoad, {
                        ctx: ctx,
                        action: hasLayoutChanged && cmpDef.layout ? 'index' : cmpDef.action,
                        error: onError,
                        success: function (ctl) {
                            if (cmpDef.layout) {
                                ctl.addChild('lazo-layout-body', cmpDef.name, {
                                    ctx: {
                                        params: ctx.params
                                    },
                                    action: cmpDef.action,
                                    success: function () {
                                        options.success(ctl, ctx, cmpDef, options);
                                    },
                                    error: onError
                                });
                            } else {
                                options.success(ctl, ctx, cmpDef, options);
                            }
                        }
                    });
                },
                error: onError
            });
        }

    }, assetsMixin);

});
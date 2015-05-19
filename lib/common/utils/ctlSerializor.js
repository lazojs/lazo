define(['underscore', 'lazoModel'], function (_, Model) {

    'use strict';

    return {

        serialize: function (ctl, rootCtx) {
            var serObj = {},
                viewRef,
                omit = rootCtx ? ['cookies', '_request', '_reply', 'models', 'collections', 'location', 'userAgent', 'headers'] :
                    ['cookies', '_request', '_reply', 'models', 'collections', '_rootCtx', 'location', 'userAgent', 'headers'];

            serObj.cid = ctl.cid;
            serObj.ctx = _.omit(ctl.ctx, omit);
            _.each(serObj.ctx.params, function (param, k) {
                delete serObj.ctx.params[k];
                // encode to prevent xss of serialized context
                serObj.ctx.params[encodeURIComponent(k)] = encodeURIComponent(param);
            });

            serObj.ctx.models = {};
            serObj.ctx.collections = {};
            serObj.isBase = ctl.isBase;
            serObj.name = ctl.name;
            if (ctl.currentView && ctl.currentView) {
                viewRef = ctl.currentView.ref;

                serObj.currentView = {
                    cid: ctl.currentView.cid,
                    name: ctl.currentView.name,
                    ref: ctl.currentView.ref,
                    templatePath: ctl.currentView.templatePath,
                    compiledTemplatePath: ctl.currentView.compiledTemplatePath,
                    basePath: ctl.currentView.basePath,
                    isBase: ctl.currentView.isBase,
                    hasTemplate: ctl.currentView.hasTemplate
                };
            }

            //children
            var serializedKids = {};
            _.each(ctl.children, function (regionChildren, region) {
                var comps = [];
                _.each(regionChildren, function (child) {
                    comps.push(child.toJSON());
                });
                serializedKids[region] = comps;
            });
            serObj.children = serializedKids;

            //models
            Model._serialize(ctl.ctx.models, serObj.ctx.models);
            Model._serialize(ctl.ctx.collections, serObj.ctx.collections);

            _.each(ctl.ctx.collections, function (value, key, list) {
                serObj.ctx.collections[key] = value._getGlobalId();
            });

            return serObj;
        },

        deserialize: function (ctl, options) {

        }

    };

});
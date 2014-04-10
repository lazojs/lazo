define(['underscore', 'requestFilters', 'renderer', 'handlers/app/html', 'utils/document', 'bundler', 'handlers/utils', 'utils/cmpProcessor'],
    function (_, filter, renderer, html, doc, Bundler, utils, cmpProcessor) {

    'use strict';

    var bundle = new Bundler();

    return {

        reply: function (route, options, callbacks) {
            var self = this;

            // TODO: need access to ctx
            // this needs to work on the client and server
            // if ((redirect = filter.get(path, params, ctx))) {
            //     if (ctx.isXHR) {
            //         // TODO: see if this can be reworked, it's implemented as a work around for the cross origin access issue
            //         return options.success({redirect: redirect});
            //     }
            //     else {
            //         return LAZO.app.navigate(ctx, redirect);
            //     }
            // }
            cmpProcessor.process({
                options: options,
                def: cmpProcessor.getDef(route),
                success: function (ctl, ctx, assets, cmpDef) {
                    self._buildReply(ctl, ctx, assets, cmpDef, route, callbacks);
                },
                error: function (err) {
                    callbacks.error(err);
                }
            });
        },

        _buildReply: function (ctl, ctx, assets, cmpDef, route, options) {
            var cookies = ctx._rootCtx.cookies,
                self = this,
                response;

            function buildHtmlResponse(rootCtx) {
                var link,
                    i,
                    tags;

                    doc.setTitle(ctl.getPageTitle());
                    tags = _.map(doc.getTags(), function (tag) {
                        return _.clone(tag);
                    });

                function getPaths() {
                    var errTempPaths = {};

                    _.each(LAZO.errorTemplates, function (tmpDef, key) {
                        errTempPaths['' + key] = tmpDef.client;
                    });

                    return _.extend(LAZO.contexts.app.paths || {}, errTempPaths);
                }

                return html({
                    layout: cmpDef.layout || '',
                    body: renderer.getHtml(ctl),
                    rootCtl: ctl.serialize(),
                    rootCtx: JSON.stringify(rootCtx),
                    dependencies: ctx._rootCtx.dependencies,
                    tags: tags,
                    files: JSON.stringify(LAZO.files),
                    htmlTag: doc.getHtmlTag(),
                    bodyClass: doc.getBodyClass(),
                    // DO NOT COMBO HANDLE
                    // lib: false,
                    // BEGIN disable combo handling
                    lib: cookies && cookies.development === '1' ? false : bundle.getLibPath(),
                    // END disable combo handling
                    shim: JSON.stringify(LAZO.contexts.app.shim || {}),
                    paths: JSON.stringify(getPaths()),
                    args: LAZO.app.args ? JSON.stringify(LAZO.app.args) : '{}'
                });
            }

            function buildJsonResponse(rootCtx) {
                return {
                    root: rootCtx,
                    component: ctl.toJSON(),
                    layout: cmpDef.layout
                };
            }

            // entry point
            (function (self) {
                var rootCtx = utils.getRootCtxForReply(ctx, assets);

                // DO NOT COMBO HANDLE
                // ctx._rootCtx.dependencies.css = LAZO.app.css.slice(0).concat(ctx._rootCtx.dependencies.css);
                // return options.success(ctx.isXHR ? buildJsonResponse(rootCtx) : buildHtmlResponse(rootCtx));

                // BEGIN disable combo handling
                if (cookies && cookies.development === '1') {
                    ctx._rootCtx.dependencies.css = LAZO.app.css.slice(0).concat(ctx._rootCtx.dependencies.css);
                    return options.success(ctx.isXHR ? buildJsonResponse(rootCtx) : buildHtmlResponse(rootCtx));
                }

                // TODO: normalize path and params
                bundle.response(route, ctl.ctx.location.path, function (modules) {
                    if (modules) {
                        rootCtx.dependencies.modules = modules.js;
                        rootCtx.dependencies.css = modules.css;
                    }

                    options.success(ctx.isXHR ? buildJsonResponse(rootCtx) : buildHtmlResponse(rootCtx));
                });
                // END disable combo handling

            })(this);
        },

        _include: function (rootCtx, exclude, isXHR) {
            return _.difference(_.uniq(rootCtx.modules), exclude).sort();
        },

        _hasLayoutChanged: function () {
            return LAZO.app.isClient && window.rootCtl && layout === window.rootCtl.name ? false : true;
        }

    };

});

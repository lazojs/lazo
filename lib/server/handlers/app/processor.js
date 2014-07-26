define(['underscore', 'requestFilters', 'renderer', 'handlers/app/html', 'utils/document', 'bundler', 'handlers/utils', 'utils/cmpProcessor'],
    function (_, filter, renderer, html, doc, Bundler, utils, cmpProcessor) {

    'use strict';

    var bundle = new Bundler();

    return {

        reply: function (route, options, callbacks) {
            var self = this;
            var ctx = cmpProcessor.createCtx(options);
            var redirect;


            filter.apply(route, options, ctx, function (redirect) {
                if (redirect) {
                    return LAZO.app.navigate(ctx, redirect);
                }

                cmpProcessor.process({
                    ctx: ctx,
                    def: cmpProcessor.getDef(route),
                    success: function (ctl, ctx, assets, cmpDef) {
                        self._buildReply(ctl, ctx, assets, cmpDef, route, callbacks);
                    },
                    error: function (err) {
                        callbacks.error(err);
                    }
                });
            });
        },

        _buildReply: function (ctl, ctx, assets, cmpDef, route, options) {
            var isDevelopment = ctx.getCookie('development') === '1' ? true : false;
            var self = this;
            var response;

            function buildHtmlResponse(rootCtx) {
                var link,
                    i,
                    tags;

                    doc.setTitle(ctl.getPageTitle());
                    tags = _.map(doc.getTags(), function (tag) {
                        return _.clone(tag);
                    });

                function getPaths() {
                    var clientAppPaths = {};

                    // get the error template paths
                    _.each(LAZO.errorTemplates, function (tmpDef, key) {
                        clientAppPaths['' + key] = tmpDef.client;
                    });

                    return _.extend(LAZO.contexts.app.paths || {}, clientAppPaths);
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
                    lib: isDevelopment ? false : bundle.getLibPath(),
                    shim: JSON.stringify(LAZO.contexts.app.shim || {}),
                    paths: JSON.stringify(getPaths()),
                    args: LAZO.app.args ? JSON.stringify(LAZO.app.args) : '{}',
                    bundler: LAZO.contexts.server.paths.bundler !== LAZO.contexts.server.paths.lazoBundle ?
                        LAZO.contexts.server.paths.bundler.replace(LAZO.FILE_REPO_DIR + '/', '') : null
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

                if (isDevelopment) {
                    ctx._rootCtx.dependencies.css = LAZO.app.css.slice(0).concat(ctx._rootCtx.dependencies.css);
                    return options.success(ctx.isXHR ? buildJsonResponse(rootCtx) : buildHtmlResponse(rootCtx));
                }

                bundle.response(route, ctl.ctx.location.pathname, {
                    success: function (modules) {
                        if (modules) {
                            rootCtx.dependencies.modules = modules.js;
                            rootCtx.dependencies.css = modules.css;
                        } else { // default combo handling is a noop; return css
                            rootCtx.dependencies.css = LAZO.app.css.slice(0).concat(ctx._rootCtx.dependencies.css);
                        }

                        options.success(ctx.isXHR ? buildJsonResponse(rootCtx) : buildHtmlResponse(rootCtx));
                    },
                    error: function (err) {
                        throw err instanceof Error ? err : new Error(err);
                    }
                });
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

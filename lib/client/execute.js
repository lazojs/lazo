define(
    [
        'jquery', 'underscore', 'rehydrate/main', 'utils/prune',
        'lib/client/state', 'utils/document', 'lib/client/prime',
        'renderer', 'context', 'utils/cmpProcessor', 'requestFilters',
        'resolver/file', 'jquerycookie'
    ],
    function ($, _, rehydrate, prune, state, doc, prime, renderer, Context, cmpProcessor, filter, file) {

    'use strict';

    var bundle;
    var bundler = LAZO.initConf.bundler || 'lazoBundler';
    var rootCtx = { dependencies: { modules: { css: [], js: [] } } };

    function destroy(ctl) {
        var children = ctl.children || {},
            components = renderer.getList('component', ctl),
            i = components.length;

        while (i) {
            i--;
            try {
                renderer.cleanupView(components[i].currentView);
                components[i].currentView.remove();
                components[i]._getEl().remove();
                for (var key in components[i]) {
                    if (key === 'currentView') {
                        components[i][key].el = null;
                        components[i][key].$el = null;
                    }

                    components[i][key] = null;
                    delete components[i][key];
                }
            } catch (e) {
                LAZO.logger.warn('[client.post.destroy] Error while destroying component', ctl, e);
            }
        }
    }

    return function (eventData) {

        function process(eventData, modules) {
            var cmpDef = cmpProcessor.getDef(eventData.route);
            var options = {
                params: eventData.parameters,
                _rootCtx: LAZO.ctl.ctx._rootCtx
            };
            var ctx = cmpProcessor.createCtx(options);
            var redirect;

            filter.apply(eventData.route, eventData.parameters, ctx, function (redirect) {
                if (redirect) {
                    return LAZO.app.navigate(ctx, redirect);
                }

                cmpProcessor.process({
                    ctx: ctx,
                    def: cmpDef,
                    error: function (err) {
                        LAZO.logger.error('[client.execute]', 'Error executing component action: ' + err);
                        LAZO.error.render({
                            statusCode: '500',
                            error: 'Internal Server Error',
                            message: 'An internal server error occurred'
                        });
                        LAZO.app.trigger('navigate:application:error', eventData);
                    },
                    success: function (ctl, ctx, assets, cmpDef) {
                        var css;
                        var hasLayoutChanged = !cmpDef.layout || (cmpDef.layout !== LAZO.layout);
                        var controllers;
                        var cmpCss;

                        if (modules) {
                            delete ctx._rootCtx.dependencies;
                        } else {
                            controllers = cmpProcessor.getComponentNames(hasLayoutChanged ? ctl : LAZO.ctl);

                            // get list of files for the components and filter by file extension
                            cmpCss = file.getComponentFiles(controllers, function (fileName) {
                                return fileName.substr(-4, 4) === '.css';
                            });
                            // set paths to absolute
                            cmpCss = _.map(cmpCss, function (cssLink) {
                                return '/' + cssLink;
                            });
                            // remove old component css
                            ctx._rootCtx.dependencies.css = state.cleanUpCssDependencies(ctx._rootCtx.dependencies.css, cmpCss);
                        }

                        LAZO.layout = cmpDef.layout;
                        rootCtx = _.extend({}, rootCtx, ctx._rootCtx);
                        LAZO.app.trigger('navigate:application:response', eventData);
                        LAZO.layout = cmpDef.layout;
                        state.set(ctl, rootCtx); // push state object to history
                        css = state.getAddRemoveLinks(); // get add, remove css
                        prime(css.add, 'css', false); // prefetch css

                        Context.mergeGlobalModels(rootCtx, LAZO.ctl.ctx._rootCtx);
                        var $target = $(hasLayoutChanged ? 'body' : '[lazo-cmp-container="lazo-layout-body"]'),
                            html = renderer.getHtml(ctl);

                        if (hasLayoutChanged) {
                            destroy(LAZO.ctl); // clean up previous root controller
                            delete LAZO.ctl;
                            LAZO.ctl = ctl; // assign new controller
                        } else {
                            // layout body child changed; addChild pushes to children array;
                            // remove the old child, the first element in the children array
                            destroy(LAZO.ctl.children['lazo-layout-body'][0]);
                            LAZO.ctl.children['lazo-layout-body'].shift();
                        }

                        prune(LAZO.ctl); // remove orphaned models

                        // keep dimensions, but hide content so that new css updating does not cause any display issues
                        $target.css({ 'visibility': 'hidden' });
                        doc.updateCss(css.add, css.remove, function () {
                            if (hasLayoutChanged) {
                                $target.remove('[lazo-cmp-container]');
                                $target.append(html);
                            } else {
                                $target.html(html);
                            }
                            setTimeout(function () {
                                LAZO.error.clear();
                                $target.css({ 'visibility': 'visible'} );
                                renderer.attachViews(ctl);
                                doc.setTitle(LAZO.ctl.ctx._rootCtx.pageTitle);
                                LAZO.app.trigger('navigate:application:complete', eventData);
                            }, 0);
                        });
                    }
                });
            });
        }

        function response() {
            rootCtx = { dependencies: { modules: { css: [], js: [] } } };

            if ($.cookie('development') !== '1') {
                bundle.response(eventData.route, window.location.pathname, {
                    success: function (modules) {
                        if (modules) {
                            rootCtx.dependencies.modules = modules.js;
                            rootCtx.dependencies.css = modules.css;
                            LAZO.require(modules.js, function () {
                                process(eventData, true);
                            });
                        } else {
                            process(eventData);
                        }
                    },
                    error: function (err) {
                        throw err instanceof Error ? err : new Error(err);
                    }
                });
            } else {
                process(eventData);
            }
        }

        if (!bundle) {
            LAZO.require([bundler], function (Bundler) {
                bundle = new Bundler();
                response();
            });
        } else {
            response();
        }
    };

});
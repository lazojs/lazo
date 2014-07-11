define(
    [
        'jquery', 'underscore', 'rehydrate/main', 'utils/prune',
        'lib/client/state', 'utils/document', 'lib/client/prime',
        'renderer', 'context', 'utils/cmpProcessor', 'requestFilters', 'jquerycookie'
    ],
    function ($, _, rehydrate, prune, state, doc, prime, renderer, Context, cmpProcessor, filter) {

    'use strict';

    var bundle;
    var bundler = LAZO.initConf.bundler || 'bundler';
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
                LAZO.logger.log(e);
            }
        }
    }

    return function (eventData) {

        function process(eventData) {
            var cmpDef = cmpProcessor.getDef(eventData.route);
            var options = {
                params: eventData.parameters,
                cookies: LAZO.ctl.ctx._rootCtx.cookies.crumb,
                _rootCtx: LAZO.ctl.ctx._rootCtx
            };
            var ctx = cmpProcessor.createCtx(options);
            var redirect;

            if ((redirect = filter.get(eventData.route, eventData.parameters, ctx))) {
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

                    LAZO.layout = cmpDef.layout;
                    rootCtx = _.extend({}, rootCtx, ctx._rootCtx);
                    LAZO.app.trigger('navigate:application:response', eventData);
                    LAZO.layout = cmpDef.layout;
                    LAZO.crumb = rootCtx.cookies.crumb; // reset crumb
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
                    }

                    prune(LAZO.ctl); // remove orphaned models

                    // keep dimensions, but hide content so that new css updating does not cause any display issues
                    $target.css({ 'visibility': 'hidden' });
                    doc.updateCss(css.add, css.remove, function () {
                        $target.html(html);
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
        }

        function response() {
            rootCtx = { dependencies: { modules: { css: [], js: [] } } };

            if ($.cookie('development') !== '1') {
                bundle.response(eventData.route, window.location, function (modules) {
                    if (modules) {
                        rootCtx.dependencies.modules = modules.js;
                        rootCtx.dependencies.css = modules.css;
                        LAZO.require(modules.js, function () {
                            process(eventData);
                        });
                    } else {
                        process(eventData);
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
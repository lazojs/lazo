define(
    [
        'jquery', 'underscore', 'rehydrate/main',
        'lib/client/state', 'utils/document', 'lib/client/prime',
        'renderer', 'context', 'utils/cmpProcessor', 'bundler', 'jquerycookie'
    ],
    function ($, _, rehydrate, state, doc, prime, renderer, Context, cmpProcessor, Bundler) {

    'use strict';

    var bundle = new Bundler();

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

            cmpProcessor.process({
                options: options,
                def: cmpDef,
                error: function (err) {
                    LAZO.error.render(err);
                    LAZO.app.trigger('navigate:application:error', eventData);
                },
                success: function (ctl, ctx, assets, cmpDef) {
                    var rootCtx = ctx._rootCtx;
                    var css;

                    // TODO: read in and check filters; if match then redirect
                    // if (response.redirect) {
                    //     window.location = response.redirect;
                    //     return;
                    // }

                    LAZO.app.trigger('navigate:application:response', eventData);
                    LAZO.layout = cmpDef.layout;
                    LAZO.crumb = rootCtx.cookies.crumb; // reset crumb
                    state.set(ctl, rootCtx); // push state object to history
                    css = state.getAddRemoveLinks(); // get add, remove css
                    prime(css.add, 'css', false); // prefetch css

                    Context.mergeGlobalModels(rootCtx, LAZO.ctl.ctx._rootCtx);
                    var $target = $('body'),
                        html = renderer.getHtml(ctl);

                    destroy(LAZO.ctl); // clean up previous root controller
                    delete LAZO.ctl;
                    LAZO.ctl = ctl; // assign new controller

                    // keep dimensions, but hide content so that new css updating does not cause any display issues
                    $target.css({ 'visibility': 'hidden' });
                    doc.updateCss(css.add, css.remove, function () {
                        $target.html(html);
                        setTimeout(function () {
                            $target.css({ 'visibility': 'visible'} );
                            renderer.attachViews(ctl);
                            doc.setTitle(LAZO.ctl.ctx._rootCtx.pageTitle);
                            LAZO.app.trigger('navigate:application:complete', eventData);
                        }, 0);
                    });
                }
            });
        }

        if ($.cookie('dev') !== '1') {
            bundle.response(eventData.route, window.location, function (modules) {
                if (modules) {
                    rootCtx.dependencies.modules = modules.js;
                    rootCtx.dependencies.css = modules.css;
                    // TODO: load JS bundle
                    process(eventData);
                } else {
                    process(eventData);
                }
            });
        } else {
            process(eventData);
        }
    };

});
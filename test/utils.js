define(['lazoView'], function (LazoView) {

    'use strict';

    var id = 0;

    function setup(app) {
        app.getDefaultTemplateEngineName = function () {};
        app.getTemplateEngine = function () {};
    }

    function createCtlTree() {
        var el;
        var ctl = {
            currentView: null,
            children: {
                foo: []
            }
        };

        for (var i = 0; i < 3; i++) {
            id++;
            el = LAZO.app.isClient ? $('<div class="view-"' + id + '>') : null;

            if (!i) {
                ctl.currentView = new LazoView({ el: el });
            } else {
                ctl.children.foo.push({
                    currentView: new LazoView({ el: el })
                });
            }
        }

        return ctl;
    }

    return {
        createCtlTree: createCtlTree,
        setup: setup
    };

});
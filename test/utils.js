define(['test/mocks/lazo/view', 'test/mocks/lazo/lazo', 'underscore'], function (LazoView, lazo, _) {

    'use strict';

    var id = 0;
    var template = _.template('I am a template!');

    function setup(app) {
        app.getDefaultTemplateEngineName = function () {};
        app.getTemplateEngine = function () {
            return {
                compile: function (template) {
                    return _.template(template);
                },
                execute: function (compiledTemplate, data) {
                    return compiledTemplate(data);
                },
                engine: _.template
            };
        };
    }

    function createView(ctl, id) {
        var el;

        el = LAZO.app.isClient ? $('<div class="view-"' + id + '>') : null;
        return new LazoView({
            el: el,
            templateEngine: 'micro',
            template: template,
            ctl: ctl
        });
    }

    function createCtlTree() {
        var childCtl;
        var ctl = {
            currentView: null,
            children: {
                foo: []
            }
        };

        for (var i = 0; i < 3; i++) {
            if (!i) {
                ctl.currentView = createView(ctl, i);
                ctl.currentView.template = _.template('<div lazo-cmp-container="foo"></div>');
                ctl.cid = i;
                ctl.name = 'name' + i;
                ctl.ctx = {};
            } else {
                childCtl = {
                    currentView: null,
                    cid: i,
                    name: 'name' + i,
                    ctx: {}
                };
                childCtl.currentView = createView(childCtl, i);
                ctl.children.foo.push(childCtl);
            }
        }

        return ctl;
    }

    try {
        window.LAZO = lazo;
    } catch (err) {
        global.LAZO = lazo;
    }

    return {
        createCtlTree: createCtlTree,
        setup: setup,
        stub: function () {
            try {
                window.LAZO = lazo;
            } catch (err) {
                global.LAZO = lazo;
            }
        }
    };

});
define([
    'intern!bdd',
    'intern/chai!',
    'intern/chai!expect',
    'sinon',
    'sinon-chai',
    'test/unit/utils',
    'lazoWidgetMixin',
    'lazoWidget'
], function (bdd, chai, expect, sinon, sinonChai, utils, lazoWidgetMixin, LazoWidget) {
    chai.use(sinonChai);

    with (bdd) {
        describe('Lazo Widget Mixin', function () {

            lazoWidgetMixin.ref = true;
            lazoWidgetMixin.widgets = {
                foo: LazoWidget.extend({
                    render: function (options) {
                        options.success('I am a widget.');
                    },
                    css: ['/app/widgets/foo/index.css'],
                }),
            };

            lazoWidgetMixin.ctl = {
                name: 'bar',
                ctx: {
                    _rootCtx: {
                        dependencies: {
                            css: []
                        }
                    }
                },
                augmentCssLink: function (link) { return link; }
            };

            it('should get the html for a widget', function () {
                var dfd = this.async();
                var html = '<div><div lazo-widget="foo"></div></div>';
                lazoWidgetMixin.getWidgetsHtml(html, {
                    success: function (html) {
                        var regex = /<div><div lazo-widget="foo" class="lazo-detached lazo-rendering" lazo-widget-id="widget[0-9]+">I am a widget.<\/div><\/div>/;
                        var match = html.match(regex);

                        expect(match.length).to.be.equal(1);
                        expect(match.index).to.be.equal(0);

                        // indeirectly testing css resolution
                        expect(lazoWidgetMixin.ctl.ctx._rootCtx.dependencies.css.length).to.be.equal(1);
                        expect(lazoWidgetMixin.ctl.ctx._rootCtx.dependencies.css[0].href).to.be.equal('/app/widgets/foo/index.css');
                        expect(lazoWidgetMixin.ctl.ctx._rootCtx.dependencies.css[0]['lazo-link-ctx']).to.be.equal('bar');
                        console.log();
                        dfd.resolve();
                    },
                    error: function (err) {
                        throw err;
                    }
                });
            });

            if (LAZO.app.isClient) {
                it('should attach widgets', function () {
                    var dfd = this.async();
                    var html = '<div lazo-widget="foo"></div>';
                    var $el = $('<div><div lazo-widget="foo" class="lazo-detached lazo-rendering">I am a widget.</div></div>');

                    $el[0].parentNode = true; // pretend node is part of the DOM
                    lazoWidgetMixin.$ = function (selector) {
                        return $el.find(selector);
                    };
                    lazoWidgetMixin.attachWidgets({
                        success: function () {
                            expect(lazoWidgetMixin.widgetInstances).to.be.Object;
                            // expect(lazoWidgetMixin.widgetInstances.foo[0]).to.be.Object;
                            // expect($el.find('[lazo-widget="foo"]')[0]).to.be.equal(lazoWidgetMixin.widgetInstances.foo[0].el);
                            dfd.resolve();
                        },
                        error: function (err) {
                            throw err;
                        }
                    });
                });
            }

        });
    }
});
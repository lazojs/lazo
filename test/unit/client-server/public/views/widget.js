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

            beforeEach(function () {
                // remove previous container element
                delete lazoWidgetMixin.el;
                // clean out widgets from previous test
                lazoWidgetMixin.widgets = {};
                lazoWidgetMixin.ref = true;
                lazoWidgetMixin.widgetDefinitions = {
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
            });

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
                    // set up root el; used by attachWidgets to search for widget declarations
                    lazoWidgetMixin.el = $el[0];
                    lazoWidgetMixin.attachWidgets({
                        success: function (parent) {
                            expect(lazoWidgetMixin.widgets.foo[0]).to.be.instanceof(lazoWidgetMixin.widgetDefinitions.foo);
                            expect(lazoWidgetMixin.widgets.foo[0].el).to.be.equal($el.find('[lazo-widget="foo"]')[0]);
                            dfd.resolve();
                        },
                        error: function (err) {
                            throw err;
                        }
                    });
                });

                it('should create a widget instance', function () {
                    var dfd = this.async();
                    var $el = $('<div></div>');

                    lazoWidgetMixin.createWidget($el[0], 'foo', {
                        attributes: {
                            foo: 1,
                            bar: true,
                            baz: 'a string'
                        },
                        success: function (widget) {},
                        error: function (err) {
                            throw err;
                        }
                    });

                    // link.onload does not fire in phantomjs so success is never called for
                    // createWidget; check to see if css link node was created then run tests
                    var interval = setInterval(function () {
                        var $link = $('link[href="/app/widgets/foo/index.css"]');
                        if ($link.length) { // css link for created widget was appended to the DOM
                            var widget = lazoWidgetMixin.widgets.foo[0];
                            clearInterval(interval);
                            expect(widget.attributes.foo).to.be.equal(1);
                            expect(widget.attributes.bar).to.be.true;
                            expect(widget.attributes.baz).to.be.equal('a string');
                            expect(widget.el).to.be.equal($el[0]);
                            expect($el.attr('lazo-widget')).to.be.equal('foo');
                            expect(lazoWidgetMixin.widgets.foo[0]).to.be.instanceof(lazoWidgetMixin.widgetDefinitions.foo);
                            expect(lazoWidgetMixin.widgets.foo[0].el).to.be.equal($el[0]);
                            dfd.resolve();
                        }
                    }, 10);
                });
            }

        });
    }
});
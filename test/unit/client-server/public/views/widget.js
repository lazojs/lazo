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

            lazoWidgetMixin.widgets = {
                foo: LazoWidget.extend({
                    render: function (options) {
                        options.success('I am a widget.');
                    },
                    css: ['/app/widgets/foo/index.css']
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
                        expect(html).to.be.equal('<div><div lazo-widget="foo" class="unbound rendering">I am a widget.</div></div>');
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
                    var $el = $('<div><div lazo-widget="foo" class="unbound rendering">I am a widget.</div></div>');
                    lazoWidgetMixin.$ = function (selector) {
                        return $el.find(selector);
                    };
                    lazoWidgetMixin.attachWidgets({
                        success: function () {
                            expect($el.find('[lazo-widget="foo"]')[0]).to.be.equal(lazoWidgetMixin.widgetInstances.foo[0].el);
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
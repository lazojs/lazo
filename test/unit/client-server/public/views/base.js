define([
    'intern!bdd',
    'intern/chai!expect',
    'test/unit/utils',
    'sinon',
    'intern/chai!',
    'sinon-chai',
    'lazoView'
], function (bdd, expect, utils, sinon, chai, sinonChai, LazoView) {
    chai.use(sinonChai);

    function loadChild(viewName, options) {
        LAZO.require(['test/application/components/foo/views/' + viewName], function (View) {
            options.success(View);
        },
        function (err) {
            options.error(err);
        });
    }

    with (bdd) {

        describe('Base View', function () {

            it('should get view inner html', function () {
                var dfd = this.async();
                utils.setUpApp(function () {
                    utils.createCtlTree(function (ctl) {
                        ctl.currentView.getInnerHtml({
                            success: function (html) {
                                expect(html).to.be.equal('<div lazo-cmp-container="foo"></div>');
                                dfd.resolve();
                            },
                            error: function (err) {
                                throw err;
                            }
                        });
                    });
                });
            });

            it('should get a view attributes', function () {
                var dfd = this.async();
                utils.setUpApp(function () {
                    utils.createCtlTree(function (ctl) {
                        var attributes = ctl.currentView.getAttributes();
                        expect(attributes).to.have.property('lazo-view-id');
                        expect(attributes['lazo-view-id']).to.match(/view[0-9]+/);
                        dfd.resolve();
                    });
                });
            });

            it('should get a view serialization exclusions', function () {
                var dfd = this.async();
                utils.setUpApp(function () {
                    utils.createCtlTree(function (ctl) {
                        var exclusions = ctl.currentView.getExclusions();
                        expect(exclusions).to.deep.equal({ ctl: true, $el: true, el: true, parent: true, options: true });
                        dfd.resolve();
                    });
                });
            });

            it('should serialize data for rendering a view', function () {
                var dfd = this.async();
                utils.setUpApp(function () {
                    utils.createCtlTree(function (ctl) {
                        var exclusions = ctl.currentView.serializeData({
                            success: function (data) {
                                expect(data).to.have.property('cid');
                                dfd.resolve();
                            },
                            error: function (err) {
                                throw err;
                            }
                        });
                    });
                });
            });

            it('should augment view instance', function () {
                var dfd = this.async();
                utils.setUpApp(function () {
                    utils.createCtlTree(function (ctl) {
                        ctl.currentView.augment({ flubber: true, itemView: 'a:foo' });
                        expect(ctl.currentView).to.not.have.property('flubber');
                        expect(ctl.currentView).to.have.property('itemView');
                        dfd.resolve();
                    });
                });
            });

            it('should get view template engine', function () {
                var dfd = this.async();
                utils.setUpApp(function () {
                    utils.createCtlTree(function (ctl) {
                        ctl.currentView.getTemplateEngine({
                            success: function (engine) {
                                expect(engine).to.have.property('compile');
                                expect(engine).to.have.property('execute');
                                expect(engine).to.have.property('engine');
                                dfd.resolve();
                            },
                            error: function (err) {

                            }
                        });
                    });
                });
            });

            it('should get view renderer', function () {
                var dfd = this.async();
                utils.setUpApp(function () {
                    utils.createCtlTree(function (ctl) {
                        ctl.currentView.getRenderer({
                            success: function (renderer) {
                                renderer({}, {
                                    success: function (html) {
                                        expect(html).to.be.equal('<div lazo-cmp-container="foo"></div>');
                                        dfd.resolve();
                                    },
                                    error: function (err) {
                                        throw err;
                                    }
                                });
                            },
                            error: function (err) {
                                throw err;
                            }
                        });
                    });
                });
            });

            it('should get view template', function () {
                var dfd = this.async();
                var view = new LazoView({
                    name: 'index',
                    ctl: {
                        name: 'foo'
                    },
                    templatePath: 'test/application/components/foo/views/index.hbs'
                });

                // TODO: determine why this is only failing during ci on the client
                if (LAZO.isClient) {
                    dfd.resolve();
                }

                view.getTemplate({
                    success: function (template) {
                        expect(template).to.be.equal('I am the template.');
                        dfd.resolve();
                    },
                    error: function (err) {
                        throw err;
                    }
                });
            });

            it('should load a child view', function () {
                var dfd = this.async();
                var view = new LazoView({
                    name: 'index',
                    ctl: {
                        name: 'foo'
                    }
                });
                view._loadView = loadChild;

                view.loadChild('child', {
                    success: function (View) {
                        expect(View.prototype).to.have.property('child');
                        dfd.resolve();
                    },
                    error: function (err) {
                        throw err;
                    }
                });
            });


            it('should resolve a child view', function () {
                var dfd = this.async();
                var view = new LazoView({
                    name: 'index',
                    ctl: {
                        name: 'foo',
                        _getPath: function () {},
                        _getBasePath: function () {}
                    },
                    children: {
                        child: 'child'
                    }
                });
                view._loadView = loadChild;

                view.resolveChild('child', {
                    success: function (view) {
                        expect(view).to.be.instanceof(LazoView);
                        dfd.resolve();
                    },
                    error: function (err) {
                        throw err;
                    }
                });
            });

            it('should get child view options', function () {
                var view = new LazoView({
                    name: 'index',
                    ctl: {
                        name: 'foo',
                        _getPath: function () {},
                        _getBasePath: function () {}
                    }
                });

                var options = view.getChildOptions({
                    name: 'child'
                });

                expect(options.ctl.name).to.be.equal('foo');
                expect(options.name).to.be.equal('child');
            });

            it('should render', function () {
                var dfd = this.async();
                var view = new LazoView({
                    name: 'index',
                    ctl: {
                        name: 'foo',
                        _getPath: function () {},
                        _getBasePath: function () {},
                        ctx: {
                            _rootCtx: {},
                            getCookie: function () {
                                return '';
                            },
                            assets: {}
                        },
                        _getEl: function () {
                            return $('<div lazo-cmp-name="myCmp" lazo-cmp-id="0"></div>');
                        }
                    },
                    children: {
                        child: 'child'
                    },
                    getTemplate: function (options) {
                        options.success('<div lazo-view="child"></div>');
                    }
                });
                view._loadView = loadChild;
                view.ctl.currentView = view;

                if (LAZO.isServer) {
                    return dfd.resolve();
                }

                view.render({
                    success: function (html) {
                        var regex = /<div lazo-view-name="index" lazo-view-id="view[0-9]+" class="lazo-unbound"><div lazo-view="child"><div lazo-view-name="child" lazo-view-id="view[0-9]+" class="lazo-unbound">I am the child template.<\/div><\/div><\/div>/
                        var match = html.match(regex);

                        expect(match.length).to.be.equal(1);
                        expect(match.index).to.be.equal(0);
                        dfd.resolve();
                    },
                    error: function (err) {
                        throw err;
                    }
                });
            });

        });
    }
});
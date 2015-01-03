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

// getTemplate

        });
    }
});
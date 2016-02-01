define([
    'intern!bdd',
    'intern/chai!',
    'intern/chai!expect',
    'sinon',
    'sinon-chai',
    'test/unit/utils',
    'lazoCtl'
], function (bdd, chai, expect, sinon, sinonChai, utils, LazoController) {
    chai.use(sinonChai);

    with (bdd) {
        describe('Lazo Controller', function () {

            var getController = function (options) {
                var ctlOptions = {
                    name: 'home',
                    ctx: {
                        response: {
                            statusCode: null,
                            httpHeaders: [],
                            varyParams: []
                        }
                    }
                };

                var MyController = LazoController.extend({});
                MyController.create('home', ctlOptions, options);
            };

            it('should get/set the http status code', function () {
                var dfd = this.async();
                getController({
                    success: function (controller) {

                        expect(controller.getHttpStatusCode()).to.equal(200);
                        var ctl = controller.setHttpStatusCode(410);
                        expect(controller.getHttpStatusCode()).to.equal(410);
                        expect(ctl == controller).to.be.true;

                        dfd.resolve();
                    },
                    error: function () {
                        dfd.reject();
                    }
                });
            });

            it('should add http vary params', function () {
                var dfd = this.async();
                getController({
                    success: function (controller) {

                        expect(controller.getHttpVaryParams().length).to.equal(0);
                        var ctl = controller.addHttpVaryParam('user-agent');

                        var params = controller.getHttpVaryParams();
                        expect(params.length).to.equal(1);
                        expect(params[0]).to.equal('user-agent');
                        expect(ctl == controller).to.be.true;

                        dfd.resolve();
                    },
                    error: function () {
                        dfd.reject();
                    }
                });
            });

            it('should add http headers', function () {
                var dfd = this.async();
                getController({
                    success: function (controller) {

                        expect(controller.getHttpHeaders().length).to.equal(0);
                        var ctl = controller.addHttpHeader('X-Frame-Options', 'deny');

                        var headers = controller.getHttpHeaders();
                        expect(headers.length).to.equal(1);
                        expect(headers[0].name).to.equal('X-Frame-Options');
                        expect(headers[0].value).to.equal('deny');
                        expect(headers[0].options).to.equal(null);
                        expect(ctl == controller).to.be.true;

                        dfd.resolve();
                    },
                    error: function () {
                        dfd.reject();
                    }
                });
            });

        });
    }
});
define([
    'intern!bdd',
    'intern/chai!',
    'intern/chai!expect',
    'sinon',
    'sinon-chai',
    'test/unit/utils',
    'httpResponse',
    'lazoCtl'
], function (bdd, chai, expect, sinon, sinonChai, utils, httpResponse, LazoController) {
    chai.use(sinonChai);

    with (bdd) {
        describe('httpResponse', function () {

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

            it('can add httpHeader', function () {

                var count = httpResponse.getHttpHeaders().length;
                httpResponse.addHttpHeader('X-Frame-Options', 'deny');
                expect(httpResponse.getHttpHeaders().length).to.equal(count + 1);

            });

            it('can add vary param', function () {

                var count = httpResponse.getVaryParams().length;
                httpResponse.addVaryParam('user-agent');
                expect(httpResponse.getVaryParams().length).to.equal(count + 1);

            });

            it('can merge http response data', function () {

                var dfd = this.async();
                getController({
                    success: function (myController) {
                        var controller = myController;
                        var headerCount = httpResponse.getHttpHeaders().length;
                        var varyCount = httpResponse.getVaryParams().length;

                        controller.setHttpStatusCode(410);
                        controller.addHttpHeader('X-XSS-Protection', '1; mode=block');
                        controller.addHttpVaryParam('accept');

                        var responseData = httpResponse.mergeHttpResponseData(controller);
                        expect(responseData).to.exist;
                        expect(responseData.statusCode).to.equal(410);
                        expect(responseData.httpHeaders.length).to.equal(headerCount + 1);
                        expect(responseData.varyParams.length).to.equal(varyCount + 1);

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
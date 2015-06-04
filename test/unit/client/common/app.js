define([
    'intern!bdd',
    'intern/chai!',
    'intern/chai!expect',
    'sinon',
    'sinon-chai',
    'test/unit/utils',
    'lazoApp'
], function (bdd, chai, expect, sinon, sinonChai, utils, LazoApp) {
    chai.use(sinonChai);

    with (bdd) {
        describe('Lazo Application - client', function () {

            it('should no-op on add http vary params', function () {

                var lazoApp = new LazoApp({});
                lazoApp.isClient = true;
                expect(lazoApp.getHttpVaryParams().length).to.equal(0);
                var app = lazoApp.addHttpVaryParam('user-agent');

                var params = lazoApp.getHttpVaryParams();
                expect(params.length).to.equal(0);
                expect(app == lazoApp).to.be.true;

            });

            it('should no-op on add http headers', function () {
                var lazoApp = new LazoApp({});
                lazoApp.isClient = true;
                expect(lazoApp.getHttpHeaders().length).to.equal(0);
                var app = lazoApp.addHttpHeader('X-Frame-Options', 'deny');

                var headers = lazoApp.getHttpHeaders();
                expect(headers.length).to.equal(0);
                expect(app == lazoApp).to.be.true;
            });
        });
    }
});
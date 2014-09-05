describe('Assets Provider', function () {

    var assetsProvider;

    function getCtx() {
        return {
            _request: {
                raw: {
                    req: {
                        headers: {
                            'accept-language': 'en-US,en;q=0.8'
                        }
                    }
                }
            }
        };
    }

    beforeEach(function (done) {
        requirejs(['castle'], function (castle) {
            castle.test({
                module: 'assetsProvider',
                globals: [{ module: 'lazo', exports: 'LAZO' }],
                callback: function (module) {
                    var path = require('path');
                    LAZO.FILE_REPO_PATH = path.resolve('test/application');
                    assetsProvider = module;
                    done();
                }
            });
        });
    });

    it('should get the assets for a list of components', function (done) {
        var ctx = getCtx();
        assetsProvider.get(['foo', 'bar', 'baz'], ctx, {
            success: function (assets) {
                expect(assets.foo).to.be.empty;
                expect(assets.baz).to.be.empty;
                expect(assets.bar['info.pdf']).to.be.equal('/components/bar/assets/info.pdf');

                expect(assets.bar.name).to.be.equal('Käthe Kollwitz');
                expect(assets.bar['img/logo.png']).to.be.equal('/components/bar/assets/en-US/img/logo.png');
                done();
            }
        });
    });

    it('should get the assets for an application', function (done) {
        var ctx = getCtx();
        assetsProvider.get(['app'], ctx, {
            success: function (assets) {
                expect(assets.app['info.pdf']).to.be.equal('/app/assets/info.pdf');
                expect(assets.app.name).to.be.equal('Käthe Kollwitz');
                expect(assets.app['img/logo.png']).to.be.equal('/app/assets/en-US/img/logo.png');
                done();
            }
        });
    });

});
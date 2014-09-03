describe('route resolver', function () {

    var assets;

    beforeEach(function (done) {
        requirejs(['castle'], function (castle) {
            castle.test({
                module: 'resolver/assets',
                globals: [{ module: 'lazo', exports: 'LAZO' }],
                callback: function (module) {
                    assets = module;
                    done();
                }
            });
        });
    });

    it('should get the locales for a request', function () {
        // _request.raw.req.headers['accept-language']
        var ctx = {
            _request: {
                raw: {
                    req: {
                        headers: {
                            'accept-language': 'en;q=0.8,en-US'
                        }
                    }
                }
            }
        };

        var locales = assets.getLocales(ctx);
console.log(locales);
    });

});
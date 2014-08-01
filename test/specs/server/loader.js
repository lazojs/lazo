describe('Server Loader', function () {

    var loader;
    beforeEach(function (done) {
        requirejs(['castle'], function (castle) {
            castle.test({
                module: 'l',
                callback: function (module) {
                    loader = module;
                    done();
                }
            });
        });
    });

    it('should not load client files', function (done) {

        loader.load('foo/client/bar', null, function (module) {
            chai.expect(module).to.be.null;
            done();
        }, {});

    });

});
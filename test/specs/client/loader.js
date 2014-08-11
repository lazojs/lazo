describe('Client Loader', function () {

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

    it('should not load server files', function (done) {

        loader.load('foo/server/bar', null, function (module) {
            chai.expect(module).to.be.null;
            done();
        }, {});

    });

});
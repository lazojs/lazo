describe('server handler utils', function () {

    var utils;

    beforeEach(function (done) {
        requirejs(['castle'], function (castle) {
            castle.test({
                module: 'handlers/utils',
                callback: function (module) {
                    utils = module;
                    done();
                }
            });
        });
    });

    it('should get the parameters for a request', function () {

    });

    it('should get the cookies for a request', function () {

    });

});
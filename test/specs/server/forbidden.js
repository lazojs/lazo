describe('forbidden', function () {

    var forbidden;
    beforeEach(function (done) {
        requirejs(['castle'], function (castle) {
            castle.test({
                module: 'forbidden',
                callback: function (module) {
                    forbidden = module;
                    done();
                }
            });
        });
    });

    it('should not allow access to "server" directories', function () {
        chai.expect(forbidden('/server/foo/bar')).to.be.true;
        chai.expect(forbidden('/foo/server/bar')).to.be.true;
        chai.expect(forbidden('/server')).to.be.true;
    });

    it('should not allow access to "node_modules" directories', function () {
        chai.expect(forbidden('/node_modules/foo/bar')).to.be.true;
        chai.expect(forbidden('/foo/node_modules/bar')).to.be.true;
        chai.expect(forbidden('/node_modules')).to.be.true;
    });

    it('should allow access to common directories', function () {
        chai.expect(forbidden('/lib/foo/bar')).to.be.false;
        chai.expect(forbidden('/foo/client/bar')).to.be.false;
        chai.expect(forbidden('/common')).to.be.false;
    });

});
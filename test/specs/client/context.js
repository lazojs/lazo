describe('Context', function () {

    var Context;
    beforeEach(function (done) {
        requirejs(['castle'], function (castle) { // TODO: fix pathing
            castle.test({
                module: 'context',
                globals: [{ module: 'lazo', exports: 'LAZO' }],
                callback: function (module) {
                    Context = module;
                    done();
                }
            });
        });
    });


    it('common client', function () {
        var ctx = new Context({
            _request: {
                url: {
                    pathname: 'foo/bar/baz'
                },
                raw: { // this is expected on the server
                    req: {
                        headers: {}
                    }
                }
            }
        });

        // this will be equal to whatever the clients path is when phantom runs or the file is opened in the browser
        chai.expect(ctx.location.pathname).to.not.be.equal('foo/bar/baz');
    });

});
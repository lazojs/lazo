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

    it('common server', function () {
        var ctx = new Context({
            _request: {
                url: {
                    pathname: 'foo/bar/baz'
                },
                raw: { // this is expected on the server
                    req: {
                        headers: {
                            host: 'localhost:8080'
                        }
                    }
                },
                server: {
                    info: {
                        protocol: 'http'
                    }
                }
            },
            headers: {
                host: 'localhost:8080'
            }
        });

        chai.expect(ctx.location.pathname).to.be.equal('foo/bar/baz');
    });

});
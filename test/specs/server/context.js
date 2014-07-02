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

    it('XHR POST request', function () {
        var ctx = new Context({
            _request: {
                raw: {
                    req: {
                        headers: {
                            'x-requested-with': 'XMLHttpRequest'
                        }
                    }
                },
                server: {
                    info: {
                        protocol: 'http'
                    }
                },
                url: {}
            },
            headers: {
                'x-requested-with': 'XMLHttpRequest',
                host: 'localhost:8080'
            }
        });

        chai.expect(ctx.isXHR).to.be.true;
    });

    it('standard GET request', function () {
        var ctx = new Context({
            _request: {
                raw: {
                    req: {
                        headers: {}
                    }
                },
                server: {
                    info: {
                        protocol: 'http'
                    }
                },
                url: {}
            },
            headers: {
                host: 'localhost:8080'
            }
        });

        chai.expect(ctx.isXHR).to.be.false;
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
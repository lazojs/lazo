define([
    'intern!bdd',
    'intern/chai!',
    'intern/chai!expect',
    'sinon',
    'sinon-chai',
    'test/unit/utils',
    'resolver/route'
], function (bdd, chai, expect, sinon, sinonChai, utils, route) {
    chai.use(sinonChai);

    with (bdd) {
        describe('route resolver', function () {
            it('should transform routes', function () {
                var foo = route.transform('foo(/)');
                var bar = route.transform('bar');
                var baz = route.transform('');
                var dynamic = route.transform('foo/*bar');

                expect(foo.routeTrailingSlash).to.be.equal('/foo/');
                expect(foo.route).to.be.equal('/foo');
                expect(bar.routeTrailingSlash).to.be.null;
                expect(bar.route).to.be.equal('/bar');
                expect(baz.routeTrailingSlash).to.be.null;
                expect(baz.route).to.be.equal('/');

                if (LAZO.app.isServer) {
                    // hapi style splat
                    expect(dynamic.route).to.be.equal('/foo/{bar*}');
                } else {
                    // backbone style splat
                    expect(dynamic.route).to.be.equal('/foo/*bar');
                }
            });
        });
    }
});
define([
    'intern!bdd',
    'intern/chai!expect',
    'test/utils',
    'lib/common/resolver/route'
], function (bdd, expect, utils, route) {
    with (bdd) {
        describe('route resolver', function () {
            utils.stub('LAZO');
            it('transform routes', function () {
                var foo = route.transform('foo(/)');
                var bar = route.transform('bar');
                var baz = route.transform('');

                expect(foo.routeNoTrailingSlash).to.be.equal('/foo');
                expect(foo.route).to.be.equal('/foo/');
                expect(bar.routeNoTrailingSlash).to.be.null;
                expect(bar.route).to.be.equal('/bar');
                expect(baz.routeNoTrailingSlash).to.be.null;
                expect(baz.route).to.be.equal('/');

            });
        });
    }
});
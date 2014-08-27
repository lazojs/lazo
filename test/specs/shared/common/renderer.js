describe('Renderer', function () {

    var renderer;
    var utils;

    beforeEach(function (done) {
        requirejs(['castle', 'test/utils'], function (castle, u) {
            utils = u;
            castle.test({
                module: 'renderer',
                globals: [{ module: 'lazo', exports: 'LAZO' }],
                callback: function (module) {
                    utils.setup(LAZO.app);
                    renderer = module;
                    done();
                }
            });
        });
    });

    it('should get the index for an markup insertion in a string', function () {
        var html = '<div><div><div lazo-cmp-container="foo"></div></div></div>';
        var insertStr = '<p>hello</p>';
        var expectStr = '<div><div><div lazo-cmp-container="foo">' + insertStr + '</div></div></div>';
        var match = renderer.getInsertIndex('lazo-cmp-container', 'foo', html);
        var open = html.substr(0, match.index + match[0].length);
        var close = html.substr(match.index + match[0].length);
        var testStr = open + insertStr + close;

        expect(testStr).to.be.equal(expectStr);
    });

    it('should render a tree', function (done) {
        var ctl = utils.createCtlTree();

        renderer.getTreeHtml(ctl, null, null, function (html) {
            var containers = html.search(/lazo-cmp-container="foo"/g);
            var components = html.search(/lazo-cmp-name/g);
            var views = html.search(/lazo-view-id/g);

            expect(containers.length).to.be.equal(1);
            expect(components.length).to.be.equal(3);
            expect(views.length).to.be.equal(3);

console.log(html);
console.log(html.search(/lazo-cmp-name/g));


            done();
        });
    });
});
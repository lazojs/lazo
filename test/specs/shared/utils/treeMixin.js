describe('Tree Mixin', function () {

    var treeMixin;
    var utils;

    beforeEach(function (done) {
        requirejs(['castle', 'test/utils'], function (castle, u) {
            utils = u;
            castle.test({
                module: 'utils/treeMixin',
                globals: [{ module: 'lazo', exports: 'LAZO' }],
                callback: function (module) {
                    utils.setup(LAZO.app);
                    treeMixin = module;
                    done();
                }
            });
        });
    });

    it('should get a list of nodes', function () {
        var ctl = utils.createCtlTree();
        var views = treeMixin.getList('view', ctl);
        var components = treeMixin.getList('component', ctl);
        var i;

        expect(views.length).to.be.equal(3);
        for (i = 0; i < 3; i++) {
            expect(views[i].setElement).to.be.function;
        }

        expect(components.length).to.be.equal(3);
        for (i = 0; i < 3; i++) {
            expect(components[i].currentView).to.be.defined;
        }
    });

    it('should get a node\'s type', function () {
        var ctl = utils.createCtlTree();

        expect(treeMixin.getNodeType(ctl.currentView)).to.be.equal('view');
        expect(treeMixin.getNodeType(ctl)).to.be.equal('component');
    });

    it('should get a node\'s children', function () {
        var ctl = utils.createCtlTree();
        var children = treeMixin.getNodeChildren(ctl);

        expect(children.length).to.be.equal(2);
    });

});
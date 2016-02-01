define([
    'intern!bdd',
    'intern/chai!',
    'intern/chai!expect',
    'sinon',
    'sinon-chai',
    'test/unit/utils',
    'lazoView',
    'destroyCmp'
], function (bdd, chai, expect, sinon, sinonChai, utils, LazoView, destroyCmp) {
    chai.use(sinonChai);

    with (bdd) {
        describe('Destroy Component', function () {

            it('should clean up a context tree', function () {
                var dfd = this.async();
                utils.setUpApp(function () {
                    utils.createCtlTree(function (ctl) {
                        var parentViewSpy = sinon.spy(ctl.currentView, 'remove');
                        var parentCtlSpy = sinon.spy(ctl._getEl(), 'remove');
                        var firstChildViewSpy = sinon.spy(ctl.children.foo[0].currentView, 'remove');
                        var firstChildCtlSpy = sinon.spy(ctl.children.foo[0]._getEl(), 'remove');
                        var secondChildViewSpy = sinon.spy(ctl.children.foo[1].currentView, 'remove');
                        var secondChildCtlSpy = sinon.spy(ctl.children.foo[1]._getEl(), 'remove');

                        destroyCmp(ctl);
                        expect(parentViewSpy.calledOnce).to.be.true;
                        expect(parentCtlSpy.calledOnce).to.be.true;
                        expect(firstChildViewSpy.calledOnce).to.be.true;
                        expect(firstChildCtlSpy.calledOnce).to.be.true;
                        expect(secondChildViewSpy.calledOnce).to.be.true;
                        expect(secondChildCtlSpy.calledOnce).to.be.true;

                        dfd.resolve();
                    });
                });
            });

        });
    }
});
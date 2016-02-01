define([
    'intern!bdd',
    'intern/chai!',
    'intern/chai!expect',
    'sinon',
    'sinon-chai',
    'test/unit/utils',
    'lazoView',
    'viewManager'
], function (bdd, chai, expect, sinon, sinonChai, utils, LazoView, viewManager) {
    chai.use(sinonChai);

    with (bdd) {
        describe('View Manager', function () {

            it('should attach views in a tree', function () {
                var dfd = this.async();
                utils.setUpApp(function () {
                    utils.createCtlTree(function (ctl) {
                        var spy = sinon.spy(ctl.currentView, 'attach');
                        viewManager.attachViews(ctl, function (err) {
                            if (err) {
                                throw err;
                            }
                            expect(spy.calledOnce).to.be.true;
                            dfd.resolve();
                        });
                    });
                });
            });

            it('should clean up a tree branch', function () {
                var dfd = this.async();
                utils.setUpApp(function () {
                    utils.createCtlTree(function (ctl) {
                        var spy = sinon.spy(LazoView.prototype, 'remove');

                        viewManager.cleanup(ctl, ctl.currentView.cid);
                        expect(spy.calledThrice).to.be.true;
                        dfd.resolve();
                    });
                });
            });

        });
    }
});
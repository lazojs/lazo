define([
    'intern!bdd',
    'intern/chai!',
    'intern/chai!expect',
    'sinon',
    'sinon-chai',
    'test/unit/utils',
    'uiStateMixin',
    'jquery'
], function (bdd, chai, expect, sinon, sinonChai, utils, uiStateMixin, $) {
    chai.use(sinonChai);

    with (bdd) {
        describe('Lazo View, Widget State Mixin', function () {

            it('should set the state class for a widget or view', function () {
                if (LAZO.app.isClient) {
                    uiStateMixin.el = $('<div class="">')[0];
                }
                uiStateMixin.setState('disabled', true);
                expect(uiStateMixin._uiStates.disabled).to.be.equal('disabled');
                if (LAZO.app.isClient) {
                    expect($(uiStateMixin.el).hasClass('lazo-disbaled'));
                }
            });

        });
    }
});
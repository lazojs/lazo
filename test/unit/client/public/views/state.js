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

    uiStateMixin.el = $('<div class="focus foo disabled bar hidden baz visible ">')[0];

    with (bdd) {
        describe('Lazo View, Widget State Mixin', function () {

            it('should get the valid attribute states', function () {
                var states = uiStateMixin.getValidStates();
                expect(states.focus).to.be.true;
                expect(states.disabled).to.be.true;
                expect(states.visible).to.be.true;
                expect(states.hidden).to.be.true;
            });

            it('should get the states for a widget or view', function () {
                var states = uiStateMixin.getStates();
                expect(states.focus).to.be.equal('focus');
                expect(states.disabled).to.be.equal('disabled');
                expect(states.visible).to.be.equal('visible');
                expect(states.hidden).to.be.equal('hidden');
            });

        });
    }
});
define([
    'intern!bdd',
    'intern/chai!expect',
    'test/utils',
    'handlebars',
    'utils/handlebarsEngine'
], function (bdd, expect, utils, handlebars, hbsEng) {
    with (bdd) {
        utils.stub('LAZO');
        describe('handlebarsEngine', function () {
            it('should compile a template', function () {
                var template = hbsEng.compile('I am {{fname}} {{lname}}.');

                expect(template).to.be.function;
            });

            it('should precompile a template', function () {
                var template = hbsEng.precompile('I am {{fname}} {{lname}}.');

                expect(template).to.be.function;
            });

            it('should execute a template', function () {
                var context = {
                    fname: 'John',
                    lname: 'Doe'
                };
                var template = hbsEng.compile('I am {{fname}} {{lname}}.');

                expect(hbsEng.execute(template, context)).to.be.equal('I am John Doe.');
            });

            it('should get handlebars', function () {
                expect(hbsEng.engine.VERSION).to.be.equal(handlebars.default.VERSION);
            });

        });
    }
});
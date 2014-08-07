describe('handlebarsEngine', function () {

    var hbsEng = null;
    var hbs;


    before(function (done) {
        requirejs(['castle', 'handlebars'], function (castle, handlebars) {
            hbs = handlebars;
            castle.test({
                module: 'utils/handlebarsEngine',
                mocks: ['l'],
                callback: function (module) {
                    hbsEng = module;
                    done();
                }
            });
        });
    });

    it('should compile a template', function () {
        var template = hbsEng.compile('I am {{fname}} {{lname}}.');

        chai.expect(template).to.be.function;
    });

    it('should precompile a template', function () {
        var template = hbsEng.precompile('I am {{fname}} {{lname}}.');

        chai.expect(template).to.be.function;
    });

    it('should execute a template', function () {
        var context = {
            fname: 'John',
            lname: 'Doe'
        };
        var template = hbsEng.compile('I am {{fname}} {{lname}}.');

        chai.expect(hbsEng.execute(template, context)).to.be.equal('I am John Doe.');
    });

    it('should get handlebars', function () {
        chai.expect(hbsEng.engine.VERSION).to.be.equal(hbs.default.VERSION);
    });

});
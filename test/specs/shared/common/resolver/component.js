describe('component resolver', function () {

    var component;
    beforeEach(function (done) {
        requirejs(['castle'], function (castle) {
            castle.test({
                module: 'resolver/component',
                globals: [{ module: 'lazo', exports: 'LAZO' }],
                callback: function (module) {
                    LAZO.files = {
                        components: {
                            'components/a/a.css': true,
                            'components/a/b.css': true,
                            'components/a/c.css': true,
                            'components/b/1.css': true,
                            'components/c/1.css': true,
                            'components/d/1.css': true
                        }
                    };
                    component = module;
                    done();
                }
            });
        });
    });

    it('should get a component definition', function () {
        var def;

        LAZO.app.defaultLayout = 'regular';
        LAZO.routes = {
            '': 'home',
            '/a': 'a#action',
            '/b': { component: 'b' },
            '/c': { component: 'c', layout: 'special' },
            '/d': { component: 'd', layout: false }
        };

        def = component.getDef('');
        chai.expect(def.name).to.be.equal('home');
        chai.expect(def.action).to.be.equal('index');
        chai.expect(def.layout).to.be.equal('regular');

        def = component.getDef('/a');
        chai.expect(def.name).to.be.equal('a');
        chai.expect(def.action).to.be.equal('action');
        chai.expect(def.layout).to.be.equal('regular');

        def = component.getDef('/b');
        chai.expect(def.name).to.be.equal('b');
        chai.expect(def.action).to.be.equal('index');
        chai.expect(def.layout).to.be.equal('regular');

        def = component.getDef('/c');
        chai.expect(def.name).to.be.equal('c');
        chai.expect(def.action).to.be.equal('index');
        chai.expect(def.layout).to.be.equal('special');

        def = component.getDef('/d');
        chai.expect(def.name).to.be.equal('d');
        chai.expect(def.action).to.be.equal('index');
        chai.expect(def.layout).to.be.null;
    });

    it('should get the CSS for a component', function () {
        var css = component.getCss('a');

        chai.expect(css.length).to.be.equal(3);
        chai.expect(css[0]).to.be.equal('components/a/a.css');
        chai.expect(css[1]).to.be.equal('components/a/b.css');
        chai.expect(css[2]).to.be.equal('components/a/c.css');
    });

});
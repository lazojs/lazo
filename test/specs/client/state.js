describe('Client State', function () {

    var state;

    function stubClientRouter(LAZO) {
        var history = {
            'test/a': {
                state: {
                    dependencies: {
                        css: ['a.css']
                    }
                }
            },
            'test/b': {
                state: {
                    dependencies: {
                        css: ['b.css']
                    }
                }
            }
        };
        history[window.location.pathname] = {
                state: {
                    dependencies: {
                        css: ['c.css']
                    }
                }
        };

        LAZO.router = {
            getItem: function (url) {
                return history[url];
            },
            updateState: function (stateObj, url) {
                history[url] = { state: stateObj };
            },
            getPreviousUrl: function () {
                return 'test/a';
            }
        };
    }

    beforeEach(function (done) {
        requirejs(['castle'], function (castle) {
            castle.test({
                module: 'lib/client/state',
                globals: [{ module: 'lazo', exports: 'LAZO' }],
                callback: function (module) {
                    stubClientRouter(LAZO);
                    state = module;
                    done();
                }
            });
        });
    });

    it('should create a state object', function () {
        var ctx = {
            dependencies: {
                css: ['components/a.css', 'components/b.css']
            }
        };
        var stateObj = state.createStateObj(ctx);

        chai.expect(stateObj.dependencies.css.length).to.be.equal(2);
    });

    it('should get a state object', function () {
        chai.expect(state.get('test/a').state.dependencies.css[0]).to.be.equal('a.css');
    });

    it('should set a state object', function () {
        var ctx = {
            dependencies: {
                css: ['components/a.css', 'components/a.1.css']
            }
        };

        chai.expect(state.get(window.location.pathname).state.dependencies.css.length).to.be.equal(1);
        state.set(ctx);
        chai.expect(state.get(window.location.pathname).state.dependencies.css.length).to.be.equal(2);
    });

    it('should get the css to add and remove', function () {
        var css = state.getAddRemoveLinks();

        chai.expect(css.add[0]).to.be.equal('c.css');
        chai.expect(css.remove[0]).to.be.equal('a.css');
    });

});
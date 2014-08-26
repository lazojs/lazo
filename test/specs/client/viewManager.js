describe('Client Loader', function () {

    var viewManager;
    var LazoView;
    var id = 0;

    function setup(app) {
        app.getDefaultTemplateEngineName = function () {};
        app.getTemplateEngine = function () {};
    }

    function createCtlTree() {
        var ctl = {
            currentView: null,
            children: {
                foo: []
            }
        };

        for (var i = 0; i < 3; i++) {
            id++;
            $('body').append('<div class="view-"' + id + '>');

            if (!i) {
                ctl.currentView = new LazoView({ el: $('.view-' + id) });
            } else {
                ctl.children.foo.push({
                    currentView: new LazoView({ el: $('.view-' + id) })
                });
            }
        }

        return ctl;
    }

    beforeEach(function (done) {
        requirejs(['castle', 'lazoView'], function (castle, LView) {
            LazoView = LView;
            castle.test({
                module: 'viewManager',
                globals: [{ module: 'lazo', exports: 'LAZO' }],
                callback: function (module) {
                    setup(LAZO.app);
                    viewManager = module;
                    done();
                }
            });
        });
    });

    it('should attach a view', function () {
        $('body').append('<div class="view-attach">');
        var $view = $('.view-attach');
        var view = new LazoView();
        var afterRenderSpy = sinon.spy(view, 'afterRender');
        var setElementSpy = sinon.spy(view, 'setElement');

        viewManager.attachView(view, $view[0]);
        expect($view[0]).to.be.equal(view.el);
        expect(afterRenderSpy.calledOnce).to.be.true;
        expect(setElementSpy.calledOnce).to.be.true;
    });

    it('should attach views in a tree', function () {
        var ctl = createCtlTree();
        var spy = sinon.spy(viewManager, 'attachView');

        viewManager.attachViews(ctl, ctl.currentView.cid);
        expect(spy.calledThrice).to.be.true;
    });

    it('should clean up a view', function () {
        $('body').append('<div class="view-cleanup">');
        var $view = $('.view-cleanup');
        var view = new LazoView({ el: $view });
        var onRemoveSpy = sinon.spy(view, 'onRemove');
        var stopListening = sinon.spy(view, 'stopListening');
        var undelegateEvents = sinon.spy(view, 'undelegateEvents');

        viewManager.cleanupView(view);
        expect(onRemoveSpy.calledOnce).to.be.true;
        expect(stopListening.calledOnce).to.be.true;
        expect(undelegateEvents.calledOnce).to.be.true;
    });

    it('should clean up a tree branch', function () {
        var ctl = createCtlTree();
        var spy = sinon.spy(viewManager, 'cleanupView');

        viewManager.cleanup(ctl, ctl.currentView.cid);
        expect(spy.calledThrice).to.be.true;
    });

});
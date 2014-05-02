define(['lazoMocksCtxFactory', 'lazoMocksCtl', 'underscore', 'lazoMocksView'], function (ctxFactory, Ctl, _, View) {

    return function (options) {
        var ctl = new Ctl();
        var view = new View(ctl);
        var defaults = {
            name: 'ctl-mock',
            isBase: false,
            ctx: ctxFactory(),
            cid: 'ctl-mock' + Math.floor(Math.random() * 1000),
            currentView: view
        };

        return _.extend(ctl, defaults, options);
    };

});
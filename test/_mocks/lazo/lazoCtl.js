define(['lazoMocksBase'], function (Base) {

    'use strict';

    var Controller = Base.extend({

        setPageTitle: function () {},

        loadCollection: function (name, options) {
            options.success({}); // TODO: mock model
        },

        loadModel: function (name, options) {
            options.success({}); // TODO: mock model
        },

        ctx: {

            collections: {},

            models: {},

            getCookie: function (key) {
                return this._rootCtx.cookies[key];
            },

            _rootCtx: {}
        }

    });

    return Controller;

});
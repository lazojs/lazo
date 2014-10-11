define(['./base.js'], function (Base) {

    'use strict';

    var Controller = Base.extend({

        setPageTitle: function () {},

        loadCollection: function (name, options) {
            options.success({}); // TODO: mock model
        },

        ctx: {

            collections: {},

            models: {}

        }

    });

    return Controller;

});
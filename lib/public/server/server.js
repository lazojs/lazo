define(['base'], function (Base) {

    'use strict';

    return Base.extend({

        setup: function (hapi, pack, servers, options) {
            options.success();
        }

    });

});
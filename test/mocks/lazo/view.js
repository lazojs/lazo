define(['lazoMocksBase', 'underscore'], function (Base, _) {

    'use strict';

    var isServer = true;
    var isClient = true;

    try {
        window;
        isServer = false;
    } catch (err) {
        isClient = false;
    }

    var defaults = {
        isBase: false,
        isServer: isServer,
        isClient: isClient,
        hasTemplate: true,
        name: 'view-mock',
        ctl: {},
        cid: 'view' + Math.floor(Math.random() * 1000),
        templatePath: 'foo/bar/baz'
    };

    return Base.extend({

        constructor: function (options) {
            _.extend(this, defaults, options);
        }

    });

});
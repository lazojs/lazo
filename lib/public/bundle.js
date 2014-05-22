define(['underscore', 'base', 'resolver/component'], function (_, Base, cmpResolver) {

    'use strict';

    return Base.extend({

        response: function (route, uri, callback) {
            callback(null);
        },

        getLibPath: function () {
            return LAZO.conf.libPath;
        },

        resolveBundleUrl: function (bundle) {
            return bundle;
        },

        getComponentDef: function (route) {
            return cmpResolver.getDef(route);
        }

    });

});
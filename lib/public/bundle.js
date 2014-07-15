define(['underscore', 'base', 'resolver/component'], function (_, Base, cmpResolver) {

    'use strict';

    return Base.extend({

        response: function (route, uri, options) {
            options.success(null);
        },

        getLibPath: function () {
            return LAZO.conf.libPath;
        },

        resolveBundleUrl: function (bundle) {
            return bundle;
        },

        getComponentDef: function (route) {
            return cmpResolver.getDef(route);
        },

        getComponentCSS: function (name) {
            return cmpResolver.getCss(name);
        }

    });

});
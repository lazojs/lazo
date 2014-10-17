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
            return cmpResolver.getLinks(name, 'css');
        },

        getComponentImports: function (name) {
            return cmpResolver.getLinks(name, 'import');
        },

        createCSSLink: function (link) {
            var defaults = {
                rel: 'stylesheet',
                type: 'text/css'
            };

            if (_.isString(link)) {
                return _.extend({ href: link }, defaults);
            } else {
                return _.extend({}, defaults, link);
            }
        },

        createCSSLinks: function (links) {
            return _.map(links, this.createCSSLink);
        },

        createImportLink: function (link) {
            var defaults = {
                rel: 'import'
            };

            if (_.isString(link)) {
                return _.extend({ href: link }, defaults);
            } else {
                return _.extend({}, defaults, link);
            }
        },

        createImportLinks: function (links) {
            return _.map(links, this.createImportLink);
        }

    });

});
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

        getComponentCss: function (name) {
            return cmpResolver.getLinks(name, 'css');
        },

        getComponentImports: function (name) {
            return cmpResolver.getLinks(name, 'import');
        },

        sortCss: function (links) {
            return links;
        },

        sortImports: function (links) {
            return links;
        },

        _createCSSLink: function (link) {
            var defaults = {
                rel: 'stylesheet',
                type: 'text/css',
                'lazo-link': 'css',
                'lazo-link-ctx': 'application'
            };

            if (_.isString(link)) {
                return _.extend({ href: link }, defaults);
            } else {
                return _.extend({}, defaults, link);
            }
        },

        _createCSSLinks: function (links) {
            return _.map(links, this._createCSSLink);
        },

        _createImportLink: function (link) {
            var defaults = {
                rel: 'import',
                'lazo-link': 'import',
                'lazo-link-ctx': 'application'
            };

            if (_.isString(link)) {
                return _.extend({ href: link }, defaults);
            } else {
                return _.extend({}, defaults, link);
            }
        },

        _createImportLinks: function (links) {
            return _.map(links, this._createImportLink);
        }

    });

});
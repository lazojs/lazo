define(['resolver/requireConfigure', 'resolver/route', 'resolver/file'],
    function (requireConfigure, routeRes, file, loader) {

    'use strict';

    return {

        // requirejs config generator
        getReqConfig: function (env, options, callback) {
            requireConfigure.get(env, options, callback);
        },

        // route transformer
        transformRoute: function (route) {
            return routeRes.transform(route);
        },

        // file helpers
        isBase: function (modulePath, moduleType, callback, options) {
            var isExtenededClass = (LAZO.files.components[modulePath + '.js'] ||
                LAZO.files.appViews[modulePath + '.js']) ||
                LAZO.files.models[modulePath + '.js'];

            return callback(isExtenededClass ? false : true);
        },

        getPath: function (moduleName, cmpName, moduleType) {
            return file.getPath(moduleName, cmpName, moduleType);
        },

        getBasePath: function (moduleName, cmpName, moduleType) {
            return file.getBasePath(moduleName, cmpName, moduleType);
        },

        getTemplateName: function (view) {
            return file.getTemplateName(view);
        },

        getTemplatePath: function (view) {
            return file.getTemplatePath(view);
        },

        convertTemplatePath: function (templatePath) {
            return file.convertTemplatePath(templatePath);
        },

        getComponentCSS: function (cmpName) {
            var css = [];

            _.each(LAZO.files.components, function (val, key) {
                if (key.indexOf(cmpName) !== -1 && key.indexOf('.css') !== -1) {
                    css.push(key);
                }
            });

            return css;
        },

        resolvePath: function (from, to) {
            return file.resolvePath(from, to);
        }

    };

});
define(function () {

    'use strict';

    var REGEX_QUERY_STRING = /(\(?\?.*)$/;
    var REGEX_PATH_PARAM = /:(\w+)/g;
    var REGEX_OPT_PATH_PARAM = /\(\/\{(\w+)\}(\/?)\)$/;
    var REGEX_OPT_TRAILING_SLASH = /(.*)\(\/\)$/;
    var REGEX_DYNAMIC_PATH = /(\*)(\w+)/g;

    return {

        transform: function (route) {
            var routeTrailingSlash = null;

            route = '/' + route;
            route = route.replace(REGEX_QUERY_STRING, '');
            route = route.replace(REGEX_PATH_PARAM, '{$1}');
            route = route.replace(REGEX_OPT_PATH_PARAM, '/{$1?}$2');

            if (REGEX_OPT_TRAILING_SLASH.test(route)) {
                route = route.replace(REGEX_OPT_TRAILING_SLASH, '$1');
                // handle case of developer adding a trailing slash to a dynamic path:
                // test-dynamic-routes/*nodes(/)
                if (!REGEX_DYNAMIC_PATH.test(route)) {
                    routeTrailingSlash = route + '/';
                }
            }

            // transform backbone style splats to hapi splats:
            // test-dynamic-routes/*nodes -> test-dynamic-routes/{nodes*}
            if (LAZO.app.isServer) {
                route = route.replace(REGEX_DYNAMIC_PATH, '{$2$1}');
            }

            return {
                routeTrailingSlash: routeTrailingSlash,
                route: route
            };
        }

    };

});
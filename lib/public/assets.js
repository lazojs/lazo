define(['assetsProvider'], function (assetsProvider) {

    'use strict';

    return Base.extend({

        // default implementation would add a pointer to application level assets to component assets
        get: function (components, options) {
            assetsProvider.get(components, options);
        },

        // server uses accept-language header and client uses navigator.languages, navigator.language
        // returns an array of locales ordered by resolution precedence
        // extendable for setting the locale; example would be an application that sets a locale cookie
        // and then resolves to a locale based on the cookie value
        getLocales: function () {
            return assetsProvider.getLocales(components, options);
        },

        // uses locale(s) to determine the best match
        // then pulls in defaults, e.g., “component/cmp_name/strings.json"
        resolveAsset: function (key, list) {
            var locales = this.locales();
            return assetsProvider.resolveAsset(key, list, locales);
        },

        // extendable; default is to remove the locale folder from the key, e.g.,
        // “en-US/img/foo.png” would resolve to “img/foo.png"
        resolveAssetKey: function (key) {
            return assetsProvider.resolveAssetKey(key);
        },

        // extendable; default is to return a path that can be served from the application server
        resolveAssetPath: function (path) {
            return assetsProvider.resolveAssetPath(path);
        }

    });

});
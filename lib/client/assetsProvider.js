/*global define:false, LAZO:false*/

define(['jquery', 'underscore'], function ($, _) {

    var AssetsProvider = LAZO.app.assets.Provider.extend({

        list: function (options) {
            var fetchAssets = [];
            var assets = {};
            var components = options.componentName;
            var asset;

            for (var i = 0; i < components.length; i++) {
                if ((asset = LAZO.ctl.ctx._rootCtx.assets[components[i]])) {
                    assets[components[i]] = asset;
                } else {
                    fetchAssets.push(components[i]);
                }
            }

            if (!fetchAssets.length) {
                return options.success(assets);
            }

            $.ajax({
                data: {
                    componentName: fetchAssets.join(',')
                },
                error: function (error) {
                    options.error(error);
                },
                success: function (result) {
                    _.extend(LAZO.ctl.ctx._rootCtx.assets, result);
                    options.success(_.extend(assets, result));
                },
                url: '/assets'
            });
        }

    });

    return AssetsProvider;
});

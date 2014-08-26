/*global define:false, LAZO:false*/

define(['jquery', 'underscore'], function ($, _) {

    var AssetsProvider = LAZO.app.assets.Provider.extend({

        list: function (options) {
            var assets = LAZO.ctl.ctx._rootCtx.assets[options.componentName];
            if (assets) {
                return options.success(assets);
            }

            $.ajax({
                data: {
                    componentName: options.componentName
                },
                error: function (error) {
                    options.error(error);
                },
                success: function (result) {
                    result[options.componentName] = result[options.componentName] || {};
                    _.extend(LAZO.ctl.ctx._rootCtx.assets, result);
                    options.success(result);
                },
                url: '/assets'
            });
        }

    });

    return AssetsProvider;
});

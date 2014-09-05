define(['jquery', 'underscore', 'resolver/assets'], function ($, _, utils) {

    'use strict';

    return _.extend({

        get: function (components, ctx, options) {
            var fetchAssets = [];
            var assets = {};
            var asset;
            var i = components.length;
            var self = this;

            while (i--) {
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
                    components: fetchAssets.join(',')
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

    }, utils);

});

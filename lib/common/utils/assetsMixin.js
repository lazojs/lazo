define(['assets'], function (LazoAssets) {

    'use strict';

    var assets = new LazoAssets();

    return {

        getAssets: function (cmpName, ctx, options) {
            if (!LAZO.app.getAssets) {
                return options.success({});
            }

            assets.get([cmpName], ctx, {
                success: function (assets) {
                    options.success(assets[cmpName]);
                },
                error: function (err) {
                    options.error(err);
                }
            });
        }

    };

});
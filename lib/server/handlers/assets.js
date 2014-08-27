define(['assetsProvider'], function (AssetsProvider) {

    var assetsProvider = new AssetsProvider();
    if (LAZO.app.assets.getPlugin() === null) {
        LAZO.app.assets.setPlugin(new LAZO.app.assets.DefaultPlugin({ provider: assetsProvider }));
    }

    return function (request, reply) {
        function onError() {
            reply([]);
        }

        function onSuccess(assetList) {
            reply(assetList);
        }

        if (!request.query) {
            return onError();
        }

        assetsProvider.list({
            componentName: request.query.componentName.split(','),
            success: onSuccess,
            error: onError
        });
    };

});
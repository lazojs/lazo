define(['assets'], function (LazoAssets) {

    var assets = new LazoAssets();

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

        assets.get(request.query.components.split(','), {
            _request: request,
        }, {
            success: onSuccess,
            error: onError
        });
    };

});
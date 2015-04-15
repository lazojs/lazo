define(['assets', 'context', 'handlers/utils'], function (LazoAssets, Context, utils) {

    var assets = new LazoAssets();

    return function (request, reply) {
        var ctx = new Context(utils.createCtxOptions(request, reply));

        function onError(err) {
            LAZO.logger.warn('[assets.get] an error occurred while querying the assets end point.', err);
            reply({});
        }

        function onSuccess(assets) {
            reply(assets);
        }

        if (!request.query) {
            return onError(new Error('Query parameters not defined.'));
        }

        assets.get(request.query.components.split(','), ctx, {
            success: onSuccess,
            error: onError
        });
    };

});
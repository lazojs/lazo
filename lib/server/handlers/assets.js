define(['assets', 'context', 'handlers/utils'], function (LazoAssets, Context, utils) {

    var assets = new LazoAssets();

    return function (request, reply) {
        var ctx = new Context({
            params: utils.getParams(request),
            cookies: utils.getCookies(request),
            _request: request,
            _reply: reply,
            headers: utils.getHeaders(request),
            url: utils.getParsedUrl(request)
        });

        function onError(err) {
            LAZO.logger.warn('[assets.get] an error occured while querying the assets end point.', err);
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
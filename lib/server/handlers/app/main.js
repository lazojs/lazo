define(['handlers/utils', 'handlers/app/processor'], function (utils, processor) {

    return function (request, reply, route, svr) {
        var payload = request.payload;
        var options = utils.createCtxOptions(request, reply);

        LAZO.logger.debug('[server.handlers.app.main.processor.reply] Processing route request...', route, options.url.href);

        processor.reply(route, options, {
            error: function (err) {
                err = err instanceof Error ? err : new Error(err);
                LAZO.logger.warn('[server.handlers.app.main.processor.reply] Error processing request...', route, options.url.href, err);
                throw err; // hapi domain catches error
            },
            success: function (response) {
                reply(response);
            }
        });
    };

});
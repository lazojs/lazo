define(['handlers/utils', 'handlers/app/processor'], function (utils, processor) {

    return function (request, reply, route, svr) {
        var payload = request.payload,
            options = {
                params: utils.getParams(request),
                cookies: utils.getCookies(request),
                _rawReq: request,
                svr: svr,
                headers: utils.getHeaders(request),
                url: utils.getParsedUrl(request)
            };

        if (payload && payload._lazo) {
            options.exlcude = payload._lazo.exclude;
            options.layout = payload._lazo.layout;
        }

        processor.reply(route, options, {
            error: function (err) {
                err = err instanceof Error ? err : new Error(err);
                LAZO.logger.log('error', 'processor.reply', 'Error processing request, ' + err, err);
                throw err; // hapi domain catches error
            },
            success: function (response) {
                reply(response);
            }
        });

    };

});
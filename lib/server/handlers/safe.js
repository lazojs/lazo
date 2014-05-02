define(['continuation-local-storage', 'cluster', 'domain', 'hapi'], function (cls, cluster, domain, hapi) {

    var onServerStop = function () {
        LAZO.logger.error('[server.handlers.safe] Server stopped. Killing process...');
        process.exit(1);
    };

    return function (server, handler, context) {
        var lazoNs = cls.getNamespace('lazojs') || cls.createNamespace('lazojs');

        if (!server || server.constructor !== hapi.Server) {
            throw new TypeError();
        }

        if (typeof handler !== 'function') {
            throw new TypeError();
        }

        return function (request, reply) {
            var handlerArgs = arguments;
            var handlerDomain = domain.create();
            var uncaughtCount = 0;

            var onError = function (error) {
                lazoNs.set('request', request);

                LAZO.logger.error('[server.handlers.safe] Unhandled error: %s %j', error.message, error.stack);

                switch (uncaughtCount++) {
                    case 0:
                        reply(error);
                        break;
                    case 1:
                        if (cluster.isWorker) {
                            cluster.worker.disconnect();
                        }
                        LAZO.logger.error('[server.handlers.safe] Stopping server...');
                        server.stop(onServerStop);
                        break;
                    default:
                        // Ignore
                        break;
                }
            };

            handlerDomain.on('error', lazoNs.bind(onError, lazoNs.createContext()));

            handlerDomain.run(function () {
                handler.apply(context || this, handlerArgs);
            });
        };
    };

});

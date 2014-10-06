define(['l!appServerSetup'], function (Server) {

    'use strict';

    var server = new Server();

    return function (hapi, pack, servers, callback) {
        server.setup(hapi, pack, servers, {
            success: function () {
                callback(null);
            },
            error: function (err) {
                callback(err);
            }
        });
    };

});
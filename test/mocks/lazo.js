define(function () {

    var LAZO = {},
        isServer = true,
        isClient = true;

    try {
        window;
        isServer = false;
    } catch (err) {
        isClient = false;
    }

    LAZO.app = {

        isServer: isServer,

        isClient: isClient

    };

    LAZO.logger = {
        log: function () {}
    };

    return LAZO;

});
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
        log: function () {},
        debug: function() {},
        warn: function () {}
    };

    LAZO.config = {
        get: function(key) {
            return this[key];
        },
        set: function(key, value) {
            this[key] = value;
        }
    };

    return LAZO;

});
define(['utils/handlebarsEngine'], function (handlebarsEngine) {

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
        isClient: isClient,
        navigate: function(){},
        getTemplateEngine: function () {
            return handlebarsEngine;
        },
        getTemplateExt: function () {
            return 'hbs';
        }
    };

    LAZO.logger = {
        log: function () {},
        info: function() {},
        debug: function() {},
        warn: function () {},
        error: function () {},
        setLevel: function () {}
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
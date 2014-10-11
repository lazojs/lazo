define(['lib/vendor/handlebars.amd'], function (handlebarsEngine) {

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
            return {
                compile: function(template) {
                    return Handlebars.default.compile(template);
                },
                precompile: function (template) {
                    return Handlebars.default.precompile(template);
                },
                execute: function(template, context, templateName) {
                    return template(context);
                },
                engine: Handlebars.default
            };
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
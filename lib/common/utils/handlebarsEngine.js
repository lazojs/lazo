define(['handlebars'], function (Handlebars) {

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
});

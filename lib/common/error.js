define(['jquery', 'underscore'], function ($, _) {

    'use strict';

    return {

        clear: function () {
            $('[lazo-error]').remove();
            $('body > [lazo-cmp-name]').show();
        },

        render: function (errContext) {
            LAZO.require(['text!' + errContext.code, 'utils/template'], function (errTemplate, template) {
                var templateEngine = template.getDefaultTemplateEngine();
                var compiledTemplate = templateEngine.compile(errTemplate);
                var $lazoErr = $('<div lazo-error="' + errContext.code + '">');

                $('body > [lazo-cmp-name]').hide();
                $('body').append($lazoErr);
                $lazoErr.html(compiledTemplate(errContext));
            });
        }

    };

});
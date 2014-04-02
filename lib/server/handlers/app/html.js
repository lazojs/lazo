define(['text!pageTemplate', 'handlebars'], function (pageTemplate, Handlebars) {

    var compiledPage = false;

    return function (options) {
        compiledPage = compiledPage || Handlebars.default.compile(pageTemplate);
        return compiledPage(options);
    };

});
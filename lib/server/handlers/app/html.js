define(['text!pageTemplate', 'handlebars'], function (pageTemplate, Handlebars) {

    var compiledPage = Handlebars.default.compile(pageTemplate);

    return function (options) {
        return compiledPage(options);
    };

});
define(function () {

    'use strict';

    var regexes = [/\/server(\/)?/, /\/node_modules(\/)?/];

    return function (path) {
        var i = 0;
        var len = regexes.length;

        for (i; i < len; i++) {
            if (path.match(regexes[i])) {
                return true;
            }
        }

        return false;
    };

});
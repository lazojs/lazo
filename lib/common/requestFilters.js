define(function () {

    'use strict';

    var filters = {};

    function iterate(path, params, ctx, fns, i, callback) {
        if (fns[i]) {
            fns[i](path, params, ctx, {
                success: function (redirect) {
                    if (redirect) {
                        return callback(redirect);
                    } else {
                        i += 1;
                        iterate(path, params, ctx, fns, i, callback);
                    }
                },
                error: function (err) {
                    throw err instanceof Error ? err : new Error(err);
                }
            });
        } else {
            return callback();
        }
    }

    return {

        apply: function (path, params, ctx, callback) {
            var fns = [];
            var match;
            for (var key in filters) {
                if (path.match(new RegExp(key))) {
                    fns = fns.concat(filters[key]);
                }
            }

            if (!fns.length) {
                return callback();
            }

            iterate(path, params, ctx, fns, 0, callback);
        },

        add: function (regex, func) {
            filters[regex] = filters[regex] || [];
            filters[regex].push(func);
            return this;
        }

    };

});
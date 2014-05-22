define(['lazoModel', 'lazoCollection', 'resolver/main'], function (LazoModel, LazoCollection, resolver) {
    'use strict';

    var modelLoader = function (name, type, cb) {
        resolver.isBase(('models/' + name + '/' + type), 'model', function (isBase) {
            if (isBase) {
                cb(type === 'model' ? LazoModel : LazoCollection, true);
            } else {
                LAZO.require(['models/' + name + '/' + type],
                    function (model) {
                        // https://github.com/jrburke/requirejs/issues/922
                        if (typeof model === 'function') {
                            cb(model);
                        }
                    }
                );
            }
        });
    };

    return modelLoader;
});
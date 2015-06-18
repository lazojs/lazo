define(function () {

    'use strict';

    var idCounter = LAZO && LAZO.initConf ? LAZO.initConf.rootCtx.idCounter : 0;

    return function (prefix) {
        var id = ++idCounter + '';
        return prefix ? prefix + id : id;
    };

});
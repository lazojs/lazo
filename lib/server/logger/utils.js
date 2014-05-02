define(['continuation-local-storage', 'util'], function (cls, util) {

    var getRequest = function () {
        var lazoNs = cls.getNamespace('lazojs');
        var request = lazoNs && lazoNs.get('request');
        return request;
    };

    var serverStringify = function (object) {
        var options = {
            depth: 1
        };

        return util.inspect(object, options).replace(/\s+/g, ' ');
    };

    return {
        getRequest: getRequest,
        serverStringify: serverStringify
    };

});

define(['test/mocks/lazo'], function (lazo) {

    var featureModuleIds = {

    };

    try {
        window;
        isServer = false;
    } catch (err) {
        isClient = false;
    }

    return {

        augment: function (obj, feature, callback) {
            requirejs([featureModuleIds[feature]], function (module) {
                callback(obj);
            });
        }

    };

});
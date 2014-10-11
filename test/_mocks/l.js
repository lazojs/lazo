define(['module'], function (mod) {

    var excludePath = '/server/';

    try {
        window;
    } catch (e) {
        excludePath = '/client/';
    }

    function exclude(name, paths) {
        var names = name.indexOf('/') ? name.split('/') : [name];
        for (var i = 0; i < names.length; i++) {
            if (paths[names[i]] && paths[names[i]].indexOf(excludePath) !== -1) {
                return true;
            }
        }

        return false;
    }

    return {
        load: function (name, req, onload, config) {
            //req has the same API as require().
            if (name !== null && name.indexOf(excludePath) === -1 && !exclude(name, config.paths)) {

                req([name], function (value) {
                    onload(value);
                });

            } else {
                //Returning null for client side dependencies on server
                onload(null);
            }
        }
    };

});

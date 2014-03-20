define([], function () {
    "use strict";

    /**
     * Create a logger and return it. The logger will log to the console.
     */
    return {
        log: function (level, method, msg, obj) {
            console.log('[' + level + ']:(' + method + '): ' + msg);
        }
    }

});

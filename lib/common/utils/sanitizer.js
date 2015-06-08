define([], function () {

    'use strict';

    return {

        /**
         * Encodes an entity for safe display in html element text or attributes
         */
        encode: function (value) {

            // TODO: This should be expanded to include other scenarios.
            // See: https://github.com/angular/angular.js/blob/v1.3.14/src/ngSanitize/sanitize.js#L435

            return String(value)
                .replace(/&/g, '&amp;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/`/g, '&#x60;');
        }

    };

});

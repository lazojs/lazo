define(['underscore'], function (_) {

    'use strict';

    return function (cmpName, options) {
        if (typeof cmpName !== 'string') { // TODO: better error handling??? just prints the stack to the screen
            return onError(new Error('The parameter "cmpName" must be a string'));
        }

        function onError(error) {
            _.delay(options.error, 0, error);
        }

        function onCtlLoad(controller) {
            try {
                controller._execute(options.action, {
                    success: function (controller) {
                        _.delay(options.success, 0, controller);
                    },
                    error: function (err) {
                        return onError(err);
                    }
                });
            } catch (error) {
                return onError(error);
            }
        }

        options = _.defaults(options || {}, {
            action: 'index',
            name: cmpName,
            error: function () {
                return;
            },
            success: function () {
                return;
        }});

        // loader is used by ctl.addChild; requirring at run time prevents the circular dependency
        LAZO.require(['lazoCtl'], function (Ctl) {
            Ctl.create(cmpName, _.pick(options, 'ctx', 'name'), {
                success: onCtlLoad,
                error: onError
            });
        });
    };

});
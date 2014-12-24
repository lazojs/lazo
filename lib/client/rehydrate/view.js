define(['lazoView'], function (LazoView) {

    'use strict';

    return function (ctl, cmpDef, callback) {
        if (cmpDef.currentView.isBase) {
            ctl.currentView = ctl._createView(LazoView, cmpDef.currentView);
            return callback(null);
        }

        LAZO.require([cmpDef.currentView.ref], function (View) {
            ctl.currentView = ctl._createView(View, cmpDef.currentView);
            callback(null);
        }, function (err) {
            return callback(new Error('rehydrate load view failed for ' + cmpDef.currentView.ref + ': ' + err.message));
        });
    };

});
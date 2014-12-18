define(['lazoView'], function (LazoView) {

    'use strict';

    return function (ctl, cmpDef, callback) {
        if (cmpDef.currentView.isBase) {
            ctl.currentView = ctl._createView(LazoView, cmpDef.currentView);
            return callback();
        }

        LAZO.require([cmpDef.currentView.ref], function (View) {
            ctl.currentView = ctl._createView(View, cmpDef.currentView);
            callback();
        }, function (err) {
            return callback(new Error('rehydrate createLoader LAZO.require failed for ' + cmpDef.currentView.ref + ' : ' + err.message), null);
        });
    };

});
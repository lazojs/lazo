define(['renderer'], function (renderer) {

    'use strict';

    return function destroy(ctl) {
        var components = renderer.getList('component', ctl);
        var i = components.length;

        while (i) {
            i--;
            try {
                components[i].currentView.remove();
                components[i]._getEl().remove();
            } catch (e) {
                LAZO.logger.warn('[client.destroy] Error while destroying component %s: %s', ctl.name, e.message);
            }
        }
    };

});
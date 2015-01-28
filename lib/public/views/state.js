define(['jquery', 'underscore'], function ($, _) {

    var states = {
        focus: true,
        disabled: true,
        visible: true,
        hidden: true
    };

    return {
        getValidStates: function () {
            return states;
        },

        getStates: function () {
            if (LAZO.app.isServer) {
                LAZO.logger.warn('[getStates] Client only method');
            }

            var retVal = {};
            var classNames = this.el ? this.el.className.split(' ') : [];
            var validStates = this.getValidStates();
            var states = _.filter(classNames, function (className) {
                return validStates[className];
            });

            for (var i = 0; i < states.length; i++) {
                retVal[states[i]] = states[i];
            }

            return retVal;
        },

        setState: function (state, on) {
            if (!states[state]) {
                LAZO.logger.warn('[setState] Invalid state, ' + state);
                return;
            }

            if (LAZO.app.isClient) {
                $(this.el)[on ? 'addClass' : 'removeClass'](state);
            }

            this._uiStates = this._uiStates || {};
            if (on) {
                this._uiStates[state] = state;
            } else {
                delete this._uiStates[state];
            }
        }
    };

});
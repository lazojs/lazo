define(['jquery', 'underscore'], function ($, _) {

    var prefix = 'lazo';
    var states = {
        focus: true,
        disabled: true,
        visible: true,
        hidden: true
    };

    return {

        stateClassPrefix: 'lazo',

        _getStateClass: function (state) {
            return this.stateClassPrefix + '-' + state;
        },

        _getValidStates: function () {
            return states;
        },

        _getStates: function () {
            if (LAZO.app.isServer) {
                LAZO.logger.warn('[getStates] Client only method');
            }

            var self = this;
            var retVal = {};
            var state;
            var classNames = this.el ? this.el.className.split(' ') : [];
            var validStates = this._getValidStates();
            var states = _.filter(classNames, function (className) {
                var classNameParts = className.split('-');
                return classNameParts[0] === self.stateClassPrefix && validStates[classNameParts[1]] &&
                    classNameParts.length === 2;
            });

            for (var i = 0; i < states.length; i++) {
                state = states[i].split('-')[1];
                retVal[state] = state;
            }

            return retVal;
        },

        setState: function (state, on) {
            if (!states[state]) {
                LAZO.logger.warn('[setState] Invalid state, ' + state);
                return;
            }

            if (LAZO.app.isClient) {
                $(this.el)[on ? 'addClass' : 'removeClass'](this._getStateClass(state));
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
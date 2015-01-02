define(['base'], function (Base) {

    'use strict';

    return Base.extend({

        constructor: function (options) {
            this._setAttributes(options);
            this.view = options.view;
            Base.call(this, {});
        },

        attrValCoercion: true,

        render: function (options) {
            options.success('');
        },

        afterRender: function (options) {
            options.success();
        },

        bind: function (el) {},

        unbind: function (el) {},

        _setAttributes: function (attributes) {
            if (this.attrValCoercion) {
                attributes = this._coerce(attributes);
            }

            this.attributes = _.extend(this.attributes, _.omit(this._resolveAttributes(attributes), 'view'));
        },

        _setState: function () {

        },

        // coerce values, e.g, '["foo", "bar"]' to an array
        _coerce: function (attributes) {
            return attributes;
        },

        // map $.* values to context properties
        _resolveAttributes: function (attributes) {
            var self = this;
            return _.map(attributes, function (attribute, k) {
                if (!k.indexOf('$')) {
                    return self._resolveCtxVal(attribute);
                }
            });
        },

        _resolveCtxVal: function (key) {
            var keys = key.split('.').slice(1);
            var ctx = this.view.ctl.ctx;
            var struct;
            var retVal;

            for (var i = 0; i < keys.length; i++) {
                struct = ctx[keys[i]];
                retVal = struct;
                if (!retVal) {
                    break;
                }
            }

            return retVal;
        }

    });

});
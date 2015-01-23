define(['base'], function (Base) {

    'use strict';

    return Base.extend({

        constructor: function (options) {
            this.view = options.view;
            this._setAttributes(_.omit(options, 'view'));
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

            this.attributes = this.attributes || {};
            this.attributes = _.extend(this.attributes, _.omit(this._resolveAttributes(attributes), 'view'));
        },

        _setState: function () {

        },

        // coerce values, e.g, '["foo", "bar"]' to an array
        _coerce: function (attributes) {
            var val;

            for (var k in attributes) {
                val = attributes[k];
                if (val.charAt(0) === '[' || val.charAt(0) === '{') {
                    try {
                        attributes[k] = JSON.parse(val);
                    } catch (e) {
                        LAZO.logger.warn('[lazoWidget] Error while parsing attribute value', e);
                    }
                } else if (_.isNumber(val) && !_.isNaN(val)) {
                    attributes[k] = parseFloat(val);
                } else if (val === 'true') {
                    attributes[k] = true;
                } else if (val === 'false') {
                    attributes[k] = false;
                }
            }

            return attributes;
        },

        // map $.* values to context properties
        _resolveAttributes: function (attributes) {
            var self = this;
            var retVal = {};
            var ctxMappings = _.filter(attributes, function (attribute, k) {
                var isCtxMapping = !attribute.indexOf('$');
                if (!isCtxMapping) {
                    retVal[k] = attribute;
                }
                return isCtxMapping;
            });

            retVal.$ = {};
            _.each(ctxMappings, function (val, k) {
                self._resolveCtxVal(retVal.$, val);
            });

            return retVal;
        },

        _resolveCtxVal: function (attrCtx, val, key) {
            var keys = val.split('.').slice(1);
            var ctx = this.view.ctl.ctx;
            var struct;
            var retVal;

            for (var i = 0; i < keys.length; i++) {
                attrCtx[keys[i]] = ctx[keys[i]];
                if (!attrCtx) {
                    break;
                }
            }

            return attrCtx;
        }

    });

});
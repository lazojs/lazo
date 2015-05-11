define(['flexo', 'lazoViewMixin', 'underscore', 'lazoWidgetMixin'], function (flexo, lazoViewMixin, _, lazoWidgetMixin) {

    'use strict';

    return flexo.View.extend(_.extend({

        getInnerHtml: function (options) {
            var self = this;
            flexo.View.prototype.getInnerHtml.call(this, {
                success: function (html) {
                    self.getWidgetsHtml(html, {
                        success: options.success,
                        error: options.error
                    });
                },
                error: options.error
            });
        },

        attach: function (el, options) {
            flexo.View.prototype.attach.call(this, el, options);
            this.$el.removeClass(this._getStateClass('detached')).addClass(this._getStateClass('attached'));
            this._uiStates = this._getStates();
        },

        _onRemove: function () {
            var self = this;

            this._removeWidgets();
            this._removeChildViews();
        },

        _removeChildViews: function () {
            if (!this.children) {
                return;
            }

            for (var k in this.children) {
                this.children[k].remove();
            }
        }

    }, lazoViewMixin, lazoWidgetMixin));

});
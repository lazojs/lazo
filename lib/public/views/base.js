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
            this.$el.removeClass(this.getStateClass('unbound')).addClass(this.getStateClass('bound'));
            this._uiStates = this.getStates();
        },

        _onRemove: function () {
            var self = this;

            flexo.View.prototype._onRemove.call(this);
            this._removeWidgets();
        }

    }, lazoViewMixin, lazoWidgetMixin));

});
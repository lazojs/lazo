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
        }

    }, lazoViewMixin, lazoWidgetMixin));

});

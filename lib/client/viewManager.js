define(['underscore', 'jquery', 'utils/treeMixin'], function (_, $, tree) {

    'use strict';

    return _.extend({

        // Clean up view DOM bindings and event listeners.
        cleanup: function (rootNode, viewKey) {
            var views = this.getList('view', this.findView(rootNode, viewKey)),
                self = this;

            _.each(views, function (view) {
                self.cleanupView(view);
            });

            return this;
        },

        cleanupView: function (view) {
            if (_.isFunction(view.onRemove)) {
                view.onRemove();
            }
            if (_.isFunction(view._onRemove)) {
                view._onRemove();
            }
            view.stopListening();
            view.undelegateEvents();
        },

        attachViews: function (rootNode) {
            var views = this.getList('view', rootNode), // if rootNode is !specified then use last rendered stack
                self = this;

            _.each(views, function (view) {
                self.attachView(view, $('[' + self._attrs.viewId + '="' + view.cid + '"]')[0]);
                if (_.isFunction(view.attachItemViews)) {
                    view.attachItemViews();
                }
            });

            return this;
        },

        attachView: function (view, el) {
            view.setElement(el);
            view.afterRender();
        }

    }, tree);

});
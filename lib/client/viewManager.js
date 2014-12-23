define(['underscore', 'jquery', 'utils/treeMixin'], function (_, $, tree) {

    'use strict';

    return _.extend({

        // Clean up view DOM bindings and event listeners.
        cleanup: function (rootNode, viewKey) {
            var views = this.getList('view', rootNode);
            var self = this;

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

        attachViews: function (rootNode, callback) {
            var views = this.getList('view', rootNode);
            var self = this;
            var expected = _.size(views);
            var loaded = 0;

            _.each(views, function (view) {
                view.once(view.eventNameSpace + ':attached', function (view) {
                    view.afterRender();
                });
                view.attach($('[' + self._attrs.viewId + '="' + view.cid + '"]')[0], {
                    success: function (response) {
                        loaded++;
                        if (loaded === expected) {
                            callback(null, true);
                        }
                    },
                    error: function (err) {
                        callback(err, null);
                    }
                });
            });

            return this;
        },

        attachView: function (view, el) {
            view.setElement(el);
            view.afterRender();
        }

    }, tree);

});
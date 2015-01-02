define(['lazoViewMixin', 'flexo', 'underscore', 'l!viewManager', 'lazoWidgetMixin'],
    function (lazoViewMixin, flexo, _, viewManager, lazoWidgetMixin) {

    'use strict';

    return flexo.CollectionView.extend(_.extend({

        // example item and empty view schema
        // itemViews: {
        //     collectionName: 'item/view/path'
        // },

        // itemView: 'item/view/path',

        // emptyViews: {
        //     collectionName: 'empty/view/path'
        // },

        // emptyView: 'empty/view/path',

        constructor: function (options) {
            if (_.size(this.collections)) {
                for (var k in this.collections) {
                    this.collections[k] = options.ctl.ctx.collections[this.collections[k]];
                        if (!this.collections[k]) {
                            throw new Error('Could not resolve collection ' + k + ' for collection view ' + options.name);
                        }
                }
            } else if (_.isString(this.collection)) {
                this.collection = options.ctl.ctx.collections[this.collection];
                if (!this.collection) {
                    throw new Error('Could not resolve collection ' + this.collection + ' for collection view ' + options.name);
                }
            } else {
                throw new Error('No collection associated with collection view ' + options.name);
            }
            flexo.CollectionView.call(this, options);
        },

        eventNameSpace: 'lazo:colection:view',

        getInnerHtml: function (options) {
            var self = this;
            flexo.CollectionView.prototype.getInnerHtml.call(this, {
                success: function (html) {
                    self.getWidgetsHtml(html, {
                        success: options.success,
                        error: options.error
                    });
                },
                error: options.error
            });
        },

        attachItemEmptyViews: function (options) {
            var collections = _.size(this.collections) ? _.toArray(this.collections) : [this.collection];
            var len = collections.length;
            var self = this;
            var loading = 0;
            var loaded = 0;

            function isDone() {
                loaded++;
                if (loading === loaded) {
                    options.success(loaded);
                }
            }

            for (var i = 0; i < len; i++) {
                (function (i) {
                    if (collections[i].length) {
                        collections[i].each(function (model) {
                            var $el = self._getViewEl(model);
                            loading++;
                            if (self._itemViews[model.cid]) {
                                self._itemViews[model.cid].attach($el[0], {
                                    error: options.error,
                                    success: function () {
                                        self._itemViews[model.cid].afterRender();
                                        isDone();
                                    }
                                });
                            } else {
                                self.getItemView(model, collections[i], {
                                    error: options.error,
                                    success: function (View) {
                                        var view = self.createItemView(View, model, collections[i]);
                                        view.attach($el[0], {
                                            error: options.error,
                                            success: function () {
                                                view.afterRender();
                                                isDone();
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    } else {
                        var $el = this._getCollectionTarget(collections[i]);
                        loading++;
                        if (collections[i].emptyView) {
                            collections[i].emptyView.attach($el[0]);
                            collections[i].emptyView.afterRender();
                            isDone();
                        } else {
                            self.getEmptyView(collections[i], {
                                error: options.error,
                                success: function (View) {
                                    var view = self.createEmptyView(View, collections[i]);
                                    view.setElement($el[0]);
                                    view.afterRender();
                                    isDone();
                                }
                            });
                        }
                    }
                })(i);
            }
        },

        resolveCollection: function (name, options) {
            var collection = this.collection || this.ctl.ctx.collections[name];
            if (!collection) {
                return options.error(new Error('Could not resolve collection ' + name + ' in view ' + this.name));
            }

            return options.success(collection);
        },

        getViewName: function (type, collection) {
            // TODO: is this look up required this._findCollection(collection).name???
            var viewName = this[type + 's'] && this[type + 's'][this._findCollection(collection).name];
            if (!viewName) {
                viewName = this[type];
            }

            return viewName;
        },

        getItemView: function (model, collection, options) {
            this._resolveView('itemView', collection, options);
        },

        getEmptyView: function (collection, options) {
            this._resolveView('emptyView', collection, options);
        },

        getItemViewOptions: function (type, model, collection, options) {
            var name = this.getViewName(type, collection);

            return this._getItemViewOptions(_.extend({}, {
                name: this.getViewName(type, collection),
                ctl: this.ctl,
                collection: collection,
                ref: this.ctl._getPath(name, 'view'),
                baseBath: this.ctl._getBasePath(name, 'view')
            }, options));
        },

        _getViewEl: function (model) {
            return this.$('[lazo-model-id="' + model.cid + '"]');
        },

        // TODO: need to make sure that we can look up collections by name
        _getCollectionTarget: function (collection) {
            var name = this._findCollection(collection);
            return name ? $('[lazo-collection-target="' + name + '"]') : this.$el;
        },

        _resolveView: function (type, collection, options) {
            var viewName = this.getViewName(type, collection);
            if (!viewName) {
                return options.error(new Error('Could not resolve ' + type + ' for collection ' + this._findCollection(collection).name));
            }

            this._loadView(viewName, {
                error: options.error,
                success: function (View) {
                    options.success(View);
                }
            });
        },

        _onRemove: function () {
            var self = this;

            flexo.View.prototype._onRemove.call(this);
            this._removeWidgets();

            _.each(this._itemViews, function (view, key) {
                viewManager.cleanupView(view);
                delete self._itemViews[key];
            });

            _.each(this._emptyViews, function (view, key) {
                viewManager.cleanupView(view);
                delete self._emptyViews[key];
            });

            return this;
        }

    }, lazoViewMixin, lazoWidgetMixin));

});
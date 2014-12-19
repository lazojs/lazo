define(['lazoViewMixin', 'flexo', 'underscore', 'resolver/main'], function (mixin, flexo, _, resolver) {

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
            if (_.isString(this.collection)) {
                this.collection = options.ctl.ctx.collections[this.collection];
            }
            flexo.CollectionView.call(this, options);
        },

        resolveCollection: function (name, callback) {
            var collection = this.collection || this.ctl.ctx.collections[name];
            if (!collection) {
                return callback(new Error('Could not resolve collection ' + name + ' in view ' + this.name), null);
            }

            return callback(null, collection);
        },

        getViewName: function (type, collection) {
            // TODO: is this look up required this._findCollection(collection).name???
            var viewName = this[type + 's'] && this[type + 's'][this._findCollection(collection).name];
            if (!viewName) {
                viewName = this[type];
            }

            return viewName;
        },

        getItemView: function (model, collection, callback) {
            this._resolveView('itemView', collection, callback);
        },

        getEmptyView: function (collection, callback) {
            this._resolveView('emptyView', collection, callback);
        },

        getItemViewOptions: function (type, model, collection, options) {
            var name = this.getViewName(type, collection);

            return this._getItemViewOptions(_.extend({
                name: this.getViewName(type, collection),
                ctl: this.ctl,
                collection: collection,
                ref: this.ctl._getPath(name, 'view'),
                baseBath: this.ctl._getBasePath(name, 'view')
            }, options));
        },

        _resolveView: function (type, collection, callback) {
            // TODO: is this look up required this._findCollection(collection).name???
            var viewPath = this.getViewName(type, collection);
            if (!viewPath) {
                return callback(new Error('Could not resolve ' + type + ' for collection ' + this._findCollection(collection).name), null);
            }

            LAZO.require([resolver.getPath(viewPath, this.ctl.name, 'view')], function (View) {
                callback(null, View);
            },
            function (err) {
                callback(err, null);
            });
        }


    }, mixin));

});
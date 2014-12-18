define(['jquery', 'underscore', 'backbone', 'renderer', 'l!viewManager', 'flexo', 'utils/template', 'resolver/main'],
    function ($, _, Backbone, renderer, viewManager, flexo, template, resolver) {

    'use strict';

    var viewOptions = [
        'model', 'collection', 'el', 'id', 'attributes', 'className', 'tagName', 'events',
        'ctl', 'cid', 'template', 'name', 'render', 'templateEngine', 'templatePath', 'ref',
        'basePath', 'isBase', 'hasTemplate', 'getInnerHtml', 'compiledTemplatePath',
        'getTemplate'
    ];

    var LazoView = flexo.View.extend({

        hasTemplate: false,

        templateEngine: 'handlebars',

        serialize: function (obj, exceptions) { // serialize an object
            var data = {};

            for (var k in obj) { // do not use _.each; it uses hasOwnProp;
                if (!exceptions[k] && !_.isFunction(obj[k])) {
                    if (k === 'models' || k === 'collections') { // serialize the models and collections from ctl.ctx
                        data[k] = {};
                        for (var j in obj[k]) {
                            if (obj[k][j].toJSON) {
                                data[k][j] = obj[k][j].toJSON();
                            } else {
                                data[k][j] = obj[k][j];
                            }
                        }
                    } else if (obj[k] instanceof Backbone.Collection || obj[k] instanceof Backbone.Model) {
                        data[k] = obj[k].toJSON();
                    } else {
                        data[k] = obj[k];
                    }
                }
            }

            if (obj._rootCtx) {
                data.crumb = obj.getCookie('crumb');
                // work around; need to define a better way of serializing assets and other objects
                // for rendering
                data.assets = _.clone(data.assets);
                data.assets.app = {};
                _.extend(data.assets.app, _.clone(LAZO.app.assets));
                _.extend(data, obj._rootCtx.data);
            }

            return data;
        },

        getAttributes: function () {
            var keys;
            var val;
            var retVal = {};
            var attributes = {
                'lazo-view-name': 'name',
                'lazo-view-id': 'cid',
                'lazo-model-name': 'model.name',
                'lazo-model-id': 'model.cid',
                'lazo-collection-name': 'collection.name',
                'lazo-collection-id': 'collection.cid'
            };

            for (var k in attributes) {
                val = this;
                keys = attributes[k].split('.');
                for (var i = 0; i < attributes[k].length; i++) {
                    if (!(val = val[keys[i]])) {
                        delete attributes[k];
                        break;
                    } else {
                        retVal[k] = val;
                    }
                }
            }

            return retVal;
        },

        getExclusions: function () {
            return { ctl: true, $el: true, el: true, parent: true, options: true }; // properties that are not serialized
        },

        serializeData: function (callback) { // serialize data for rendering
            var data = _.extend(this.serialize(this.ctl.ctx, this.getExclusions()), this.serialize(this, this.getExclusions()));

            this.transformData(data, function (err, data) {
                callback(null, data);
            });
        },

        augment: function (options) {
            _.extend(this, _.pick(options, viewOptions));
        },

        getTemplateEngine: function (callback) {
            var engineName = this.templateEngine;

            template.loadTemplateEngine({
                name: engineName,
                handler: template.engHandlerMaker(engineName),
                exp: null,
                extension: template.getDefaultExt(engineName)
            }, {
                error: function (err) {
                    callback(err, null);
                },
                success: function (engine) {
                    callback(null, engine);
                }
            });
        },

        getRenderer: function (callback) {
            var self = this;

            if (this.renderer) {
                return callback(null, this.renderer);
            }

            this.getTemplateEngine(function (err, engine) {
                self.renderer = engine;

                self.getTemplate(function (err, template) {
                    var compiledTemplate = engine.compile(template);
                    self.template = template;

                    self.renderer = function (context, callback) {
                        callback(null, compiledTemplate(context));
                    };

                    callback(null, self.renderer);
                });
            });
        },

        getTemplate: function (callback) {
            var self = this;
            this.templatePath = resolver.getTemplatePath(this);

            LAZO.require(['text!' + self.templatePath], function (template) {
                self.hasTemplate = true;
                return callback(null, template);
            }, function (err) {
                return callback(err, null);
            });
        }

    });

    return LazoView;

});

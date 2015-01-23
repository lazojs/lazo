define(['underscore', 'backbone', 'proxy', 'resolver/model', 'async', 'utils/dataschema-json'], function (_, Backbone, Proxy, helpers, async, SchemaJSON) {

    'use strict';

    /**
     * A base class for models
     *
     * @class LazoModel
     * @constructor
     * @param {Object} attributes A hash of name-value pairs that will be the model's state
     * @param {Object} options
     *      @param {String} options.name The name of the model in the repo
     *      @param {Object} options.params A hash of name-value pairs used in url substitution
     *      @param {Context} options.ctx The current context for the request
     * @extends Backbone.Model
     */
    var LazoModel = Backbone.Model.extend({

            constructor: function (attributes, options) {
                this._initialize(attributes, options);
                Backbone.Model.apply(this, arguments);
            },

            save: function (key, val, options) {
                var attrs;

                // Handle both `"key", value` and `{key: value}` -style arguments.
                if (key == null || typeof key === 'object') {
                    attrs = key;
                    options = val;
                } else {
                    (attrs = {})[key] = val;
                }
                
                if (options && options.persist === false) {
                    // no-op, just skip the saving.
                    return;
                }

                if (options.syncDataFromChildren !== false && this.modelsSchema && this.modelsSchema.length > 0) {
                    for (var i = 0, il = this.modelsSchema.length; i < il; i++) {
                        var schema = this.modelsSchema[i],
                            paths = SchemaJSON.getPath(schema.locator),
                            parentData;
                        if (paths && paths.length && this[schema.prop]) {
                            (parentData = {})[paths[0]] = this.get(paths[0]);
                            SchemaJSON.setLocationValue(schema.locator, parentData, this[schema.prop].toJSON());
                        }
                        
                    }                        
                }
                
                Backbone.Model.prototype.save.apply(this, arguments);
            },

            set: function (key, val, options) {
                var attr, attrs;

                if (Backbone.Model.prototype.set.apply(this, arguments) == false) return false;

                // Handle both `"key", value` and `{key: value}` -style arguments.
                if (typeof key === 'object') {
                    attrs = key;
                    options = val;
                } else {
                    (attrs = {})[key] = val;
                }

                options || (options = {});

                if (key === null || !this.modelsSchema || options.syncDataToChildren === false) return this;

                for (attr in attrs) {
                    for (var i = 0, il = this.modelsSchema.length; i < il; i++) {
                        var schema = this.modelsSchema[i],
                            paths = SchemaJSON.getPath(schema.locator);
                        
                        // if an attribute being set is part of a schema definition, set the data into the child model
                        if (attr == paths[0] && this[schema.prop]) {
                            var submodeldata = SchemaJSON.apply({resultListLocator: schema.locator}, attrs);
                            this[schema.prop].set(submodeldata.results);
                        }
                    }
                }

                return this;
            },
            
            sync: function (method, model, options) {
                var self = this,
                    success = options.success;

                options.success = function (resp) {
                    self._resp = resp;

                    if (success) {
                        success(resp);
                    }
                };

                //ignoring model since this==model passed by backbone sync
                Proxy.prototype.sync.call(this, method, options);
            },

            call: function (fname, args, options) {
                Proxy.prototype.callSyncher.call(this, fname, args, options);
            },

            _initialize: function (attributes, options) {
                if (options.name) {
                    this.name = options.name;
                }
                this.params = options.params;
                this.ctx = options.ctx;
            },

            _getGlobalId: function () {
                return LazoModel._getGlobalId(this.name, this.params);
            }

        },
        {
            _serialize: function (models, serModelObj) {
                _.each(models, function (value, key, list) {
                    serModelObj[key] = value._getGlobalId();
                });
            },

            _deserialize: function (ctl, _rootCtx, options) {
                LAZO.require(['utils/modelLoader'], function (modelLoader) {
                    var processModel = function (processFuncs, value, key, type, child) {
                        var glMdlMeta = _rootCtx.modelList[value],
                            modelInstances = _rootCtx.modelInstances;

                        processFuncs[processFuncs.length] = function (asyncCb) {
                            var gid = LazoModel._getGlobalId(glMdlMeta.name, glMdlMeta.params);

                            function checkProcessing() {
                                if (modelInstances[gid].processing) {
                                    setTimeout(checkProcessing, 50);
                                }
                                else {
                                    ctl.ctx[type + 's'][key] = modelInstances[gid];
                                    asyncCb(null, modelInstances[gid]);
                                }
                                return;
                            }

                            if (modelInstances[gid]) {
                                checkProcessing();
                                return;
                            }
                            else {
                                modelInstances[gid] = {};
                                modelInstances[gid].processing = true;

                                var _initModel = function (Model, _default) {
                                                    var m = new Model(glMdlMeta.data, {name: glMdlMeta.name, ctx: ctl.ctx, params: glMdlMeta.params, parse: true});
                                                    modelInstances[gid] = m;
                                                    m.cid = glMdlMeta.cid;
                                                    m._default = _default;
                
                                                    if (glMdlMeta.idMap) {
                                                        _.each(glMdlMeta.idMap, function (elem) {
                                                            var modelItem = m.get(elem.id);
                                                            if (modelItem) {
                                                                modelItem.cid = elem.cid;
                                                            }
                                                        });
                                                    }
                
                                                    ctl.ctx[type + 's'][key] = m;

                                                    if (child && child.parentModel) {
                                                        m.lazoParent = child.parentModel;
                                                        child.parentModel.lazoChildren = child.parentModel.lazoChildren || {};
                                                        child.parentModel.lazoChildren[glMdlMeta.name] = m;

                                                        if (child.schema && child.schema.prop) {
                                                            child.parentModel[child.schema.prop] = m;

                                                            child.parentModel._childNames = child.parentModel._childNames || [];
                                                            child.parentModel._childNames.push(child.schema.prop);
                                                        }
                                                    }


                                                    if (m.modelsSchema) {
                                                        var subtasks = [];
                                                        
                                                        _.each(m.modelsSchema, function (modelSchemaDef) {
                
                                                            var subgid = LazoModel._getGlobalId(modelSchemaDef.name, glMdlMeta.params),
                                                                submodeldata = _rootCtx.modelList[subgid].data,
                                                                subtype = _.isArray(submodeldata) ? 'collection' : 'model';
                
                                                            processModel(subtasks, subgid, modelSchemaDef.name, subtype,
                                                                {
                                                                    parentModel: m,
                                                                    data: submodeldata,
                                                                    schema: modelSchemaDef
                                                                });
                                                            
                                                        });

                                                        async.parallel(subtasks, function (err, results) {
                                                            return asyncCb(null, m);
                                                        });

                                                    }
                                                    else {
                                                        return asyncCb(null, m);
                                                    }
                
                                                };

                                modelLoader(glMdlMeta.name, type, _initModel);
                            }
                        };
                    };

                    var mdlFuncs = [];

                    // models
                    _.each(ctl.ctx.models, function (value, key, list) {
                        processModel(mdlFuncs, value, key, 'model');
                    });
                    // collections
                    _.each(ctl.ctx.collections, function (value, key, list) {
                        processModel(mdlFuncs, value, key, 'collection');
                    });
                    // load models and collections in parallel
                    async.parallel(
                        mdlFuncs,
                        function (err, results) {
                            if (err) {
                                return options.error(err);
                            }
                            return options.success();
                        }
                    );
                });
            },

            _getGlobalId: function (modelName, params) {
                var globalModelId = 'GET:'+modelName;

                if (modelName.indexOf("u:") === 0 || modelName.indexOf("http") === 0) {
                    if (params) {
                        globalModelId = helpers.substitute(globalModelId, params);
                    }
                }
                else {
                    if (params) {
                        var props = _.keys(params);
                        props.sort();
                        _.each(props, function(element, index, list) {
                            globalModelId = globalModelId + "|" + element + "=" + params[element];
                        });
                    }
                }

                return globalModelId;
            }
        }

    );

    return LazoModel;
});

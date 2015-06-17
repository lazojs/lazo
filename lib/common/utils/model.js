define(['lazoModel', 'utils/modelLoader', 'utils/module', 'async', 'underscore', 'utils/dataschema-json'], function (LazoModel, modelLoader, module, async, _, SchemaJSON) {

    'use strict';

    var UtilModel = {

        process: function (modelName, options, type, child) {
            var modelInstances = options.ctx._rootCtx.modelInstances,
                modelList = options.ctx._rootCtx.modelList,
                gid = LazoModel._getGlobalId(modelName, options.params),
                path = 'models/' + modelName + '/' + type;

            function checkProcessing() {
                if (modelInstances[gid] === null) {
                    return;
                }
                else if (modelInstances[gid].processing) {
                    setTimeout(checkProcessing, 0);
                }
                else if (options.success) {
                    _.defer(options.success, modelInstances[gid]);
                }
            }

            options.error = options.error || function (err) {
                throw err;
            }; // user did not define error bubble up 500

            if (modelInstances[gid]) {
                checkProcessing();
                return;
            }

            modelInstances[gid] = {};
            modelInstances[gid].processing = true;
            var _fetch = function (Model, _default) {
                var data = child ? child.data : (modelList[gid] && modelList[gid].data ? modelList[gid].data : null);
                var m = new Model(data, {name: modelName, ctx: options.ctx, params: options.params, parse: data !== null});
                
                var registerModel = function (m, options, gid) {
                                        // add model meta info to modelList
                                        var modelMeta = {
                                            data: m._resp,
                                            cid: m.cid,
                                            id: m.id,
                                            name: m.name,
                                            params: options.params
                                        };
                    
                                        if (type === 'collection') {
                                            modelMeta.idMap = [];
                                            m.each(function (model) {
                                                modelMeta.idMap.push({cid: model.cid, id: model.id});
                                            });
                                        }
                    
                                        m.ctx._rootCtx.modelList[gid] = modelMeta;
                                        m.ctx._rootCtx.modelInstances[gid] = m;
                    
                    
                                        if (m.modelsSchema) {
                                            var tasks = [],
                                                success = options.success;
                                            
                                            
                                            _.each(m.modelsSchema, function (modelSchemaDef) {
                    
                                                var submodeldata = SchemaJSON.apply({resultListLocator: modelSchemaDef.locator}, modelMeta.data),
                                                    subtype = submodeldata && submodeldata.results
                                                        ? (_.isArray(submodeldata.results) ? 'collection' : 'model') : 'model';
                    
                                                tasks.push(function (cb) {
                                                    options.success = function () {cb();};
                                                    UtilModel.process(modelSchemaDef.name, options, subtype,
                                                        {
                                                            parentModel: m,
                                                            data: submodeldata.results,
                                                            schema: modelSchemaDef
                                                        });
                                                });
                                                
                                            });
                    
                                            async.parallel(tasks, function (err, results) {
                                                if (success) {
                                                    return success(m);
                                                }
                                            });
                                        }
                                        else {
                                            if (options.success) {
                                                return options.success(m);
                                            }
                                        }
                                    };

                m._default = _default;
                if (options.params && type === 'model') {
                    m.id = _.result(options.params, m.idAttribute);
                }
                if (!_default) {
                    module.addPath(path, options.ctx);
                }

                if (child && child.parentModel) {
                    m.lazoParent = child.parentModel;
                    child.parentModel.lazoChildren = child.parentModel.lazoChildren || {};
                    child.parentModel.lazoChildren[modelName] = m;

                    if (child.schema && child.schema.prop) {
                        child.parentModel[child.schema.prop] = m;

                        child.parentModel._childNames = child.parentModel._childNames || [];
                        child.parentModel._childNames.push(child.schema.prop);
                    }
                }

                // if data in list don't make tunnel call
                if (modelList[gid]) {
                    m.cid = modelList[gid].cid;
                    m._default = _default;
                    if (modelList[gid].idMap) {
                        _.each(modelList[gid].idMap, function (elem) {
                            var modelItem = m.get(elem.id);
                            if (modelItem) {
                                modelItem.cid = elem.cid;
                            }
                        });
                    }

                    modelInstances[gid] = m;
                    if (options.success) {
                        options.success(m);
                    }
                    return;
                }
                else if (options.fetch === false || child) {
                    if (child && child.data) {
                        m._resp = child.data;
                    }
                    registerModel(m, options, gid);
                }
                else {
                    m.fetch({
                        success: function (m) {
                            registerModel(m, options, gid);
                        },
                        error: function (model, response, opts) {
                            modelInstances[gid] = null;
                            LAZO.logger.debug('[common.utils.model.process] Error loading model %s', modelName);
                            if (options.error) { // TODO: error handling
                                return options.error(model, response, opts);
                            }
                        }
                    });
                }

            };

            modelLoader(modelName, type, _fetch);
        },

        create: function (name, attributes, options, type) {
            var _create = function (Model, _default) {

                var modelInstances = options.ctx._rootCtx.modelInstances,
                    gid = LazoModel._getGlobalId(name, options.params);

                if (modelInstances[gid]) {
                    options.success(modelInstances[gid]);
                    return;
                }

                var m = new Model((type === 'model' ? attributes : null), {name: name, ctx: options.ctx, params: options.params, parse: true});
                m._default = _default;
                var modelMeta = {
                    data: (type === 'model' ? attributes : null),
                    cid: m.cid,
                    id: m.id,
                    name: m.name,
                    params: options.params
                };
                m.ctx._rootCtx.modelList[gid] = modelMeta;
                m.ctx._rootCtx.modelInstances[gid] = m;

                if (type === 'model') {

                    if (options.persist == false) {
                        options.success(m);
                    }
                    else {
                        m.save({}, {
                            success: function (model) {
                                if (options.success) {
                                    options.success(model);
                                }
                            },
                            error: function (model, xhr, opts) {
                                LAZO.logger.warn('[common.utils.model.createModel] Error creating model %s', name);
                                if (options.error) {
                                    return options.error(model, xhr, opts);
                                }
                            }
                        });
                    }
                }
                else {
                    if (!_.isArray(attributes)) {
                        if (options.error) {
                            options.error(m, 'attributes must be an array', options);
                        }
                        return;
                    }

                    var modelOptions = {};
                    if (options && options.persist !== void 0) {
                        modelOptions.persist = options.persist;
                    }

                    _.each(attributes, function (modelData) {
                        m.create(modelData, modelOptions);
                    });

                    if (options.success) {
                        options.success(m);
                    }
                }
            };

            modelLoader(name, type, _create);
        }

    };

    return UtilModel;
});

define(['jquery', 'underscore'], function ($, _) {

    'use strict';

    function normalizeLocation(location, headers, info) {
        var keys = ['host', 'hostname', 'search', 'href', 'pathname', 'port', 'protocol'];
        var retVal = _.pick(location, keys);
        var host;

        if (headers) {
            host = headers.host.split(':');
            retVal.host = headers.host;
            retVal.hostname = host[0];
            retVal.port = host[1];
            retVal.protocol = info.protocol;
        }

        return retVal;
    }

    function Context(options) {
        var defaults = {
            _rootCtx: {
                modelList: {},
                modelInstances: {},
                cookies: options ? options.cookies : {},
                data: options && options.data ? options.data : {},
                pageTitle: options && options.pageTitle ? options.pageTitle : LAZO.app.defaultTitle
            },
            assets: {},
            collections: {},
            models: {},
            params: {}
        };

        // Create a copy and fill in default values
        options = _.defaults(_.extend({}, options), defaults);

        this.assets = options.assets;
        this.collections = options.collections;
        this.models = options.models;
        this.params = options.params;
        this.meta = options.meta;
        this.headers = options.headers;

        // Root context
        this._rootCtx = options._rootCtx;

        if (LAZO.app.isServer && options._request) {
            // Do not serialize this!
            this._request = options._request;
            this._reply = options._reply;
            // TODO: we can probably remove the xhr stuff
            this.isXHR = options._request.raw.req.headers['x-requested-with'] === 'XMLHttpRequest' ? true : false;
            this.location = normalizeLocation(options._request.url, this.headers, options._request.server.info);
            this.userAgent = this.headers['user-agent'];
        } else if (LAZO.app.isClient) {
            this.location = normalizeLocation(window.location);
            this.userAgent = window.navigator.userAgent;
        }
    }

    Context.prototype = {
        setSharedData: function (key, val) {
            this._rootCtx.data[key] = val;
            return this;
        },

        getSharedData: function (key) {
            return this._rootCtx.data[key];
        },

        getCookie: function (name) {
            if (LAZO.app.isServer) {
                return this._request.state[name] ? decodeURIComponent(this._request.state[name]) : undefined;
            } else {
                return $.cookie(name);
            }
        },

        setCookie: function (name, value, options) {
            if (LAZO.app.isServer) {
                this._reply.state(name, value, options);
            } else {
                $.cookie(name, value, options);
            }

            this._rootCtx.cookies[name] = value;
        },

        clearCookie: function (name) {
            if (LAZO.app.isServer) {
                this._reply.state(name, null, { ttl: 0 });
                this._rootCtx.cookies[name] = null;
                delete this._rootCtx.cookies[name];
            } else {
                $.removeCookie(name, null);
                this._rootCtx.cookies[name] = null;
                delete this._rootCtx.cookies[name];
            }
        }

    };

    // this is used for ctl.navigate
    Context.mergeRoot = function (receiver, giver) {
        for (var key in giver) {
            switch (key) {
                case 'dependencies':
                    break;
                case 'cookies':
                case 'data':
                    _.extend(receiver[key], giver[key]);
                    break;
                case 'modelList':
                case 'modelInstances':
                    for (var j in giver[key]) {
                        if (!receiver[key][j]) {
                            receiver[key][j] = giver[key][j];
                        }
                    }
                    break;
                case 'modules':
                    receiver[key] = receiver[key].concat(giver[key]);
                    receiver[key] = _.uniq(receiver[key]);
                    break;
                default:
                    receiver[key] = giver[key];
                    break;
            }
        }
    };

    Context.mergeGlobalModels = function (newCtx, oldCtx) {
        for (var k in oldCtx.modelList) {
            if (newCtx.modelList[k]) {
                newCtx.modelInstances[k] = oldCtx.modelInstances[k];
            }
        }
    };

    return Context;
});

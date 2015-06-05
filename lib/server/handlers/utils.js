define(['underscore'], function (_) {

    'use strict';

    return {

        getParams: function (request) {
            var params = {},
                reqParams,
                qryParams,
                key;

            if ((reqParams = _.extend(request.params, request.payload ? request.payload : {}))) {
                for (key in reqParams) {
                    params[key] = reqParams[key];
                }
            }
            if ((qryParams = request.query)) {
                for (key in qryParams) {
                    params[key] = qryParams[key];
                }
            }

            return params;
        },

        getCookies: function (request) {
            var cookies = {},
                state;
            if (!(state = request.state)) {
                return cookies;
            }

            for (var key in state) {
                cookies[key] = state[key];
            }

            return cookies;
        },

        getHeaders: function (request) {
            return request.raw.req.headers;
        },

        getParsedUrl: function (request) {
            return request.url;
        },

        createCtxOptions: function (request, reply) {
            return {
                params: this.getParams(request),
                cookies: this.getCookies(request),
                _request: request,
                _reply: reply,
                headers: this.getHeaders(request),
                url: this.getParsedUrl(request),
                response: {
                    statusCode: null,
                    httpHeaders: [],
                    varyParams: []
                }
            };
        }

    };

});
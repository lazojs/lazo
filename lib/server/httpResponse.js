define(['underscore'], function (_) {

    'use strict';

    var httpHeaders = [],
        varyHeader = [];

    return {

        addHttpHeader: function (isClient, name, value, options) {
            if (isClient) {
                return this;
            }

            httpHeaders.push({ name: name, value: value, options: options });
            return this;
        },

        getHttpHeaders: function (isClient) {
            if (isClient) {
                return [];
            }

            return httpHeaders;
        },

        addVaryParam: function (isClient, varyParam) {
            if (isClient) {
                return this;
            }

            varyHeader.push(varyParam);
            return this;
        },

        getVaryParams: function (isClient) {
            if (isClient) {
                return [];
            }

            return varyHeader;
        },

        mergeHttpResponseData: function (ctl) {
            return {
                statusCode: ctl.getHttpStatusCode() || null,
                httpHeaders: httpHeaders.concat(ctl.getHttpHeaders()),
                varyParams: _.union(varyHeader, ctl.getHttpVaryParams())
            };
        },

        applyHttpResponseData: function (response, httpResponseData) {
            if (httpResponseData.statusCode) {
                response.code(httpResponseData.statusCode);
            }

            _.each(httpResponseData.httpHeaders, function (header) {
                response.header(header.name, header.value, header.options || { override: true });
            });

            _.each(httpResponseData.varyParams, function (headerName) {
                response.vary(headerName);
            });
        }

    }
});
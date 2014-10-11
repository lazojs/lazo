define(['underscore'], function (_) {

    'use strict';

    var context = {

        assets: {},

        collections: {},

        models: {},

        params: {},

        location: 'http://context-mock.org',

        children: {}

    };

    var _rootCtx = {
        modelList: {},
        modelInstances: {},
        cookies: {},
        data: {},
        pageTitle: 'Page Title'
    };

    return function (options) {
        return _.extend({}, context, { _rootCtx: _rootCtx }, options);
    };

});
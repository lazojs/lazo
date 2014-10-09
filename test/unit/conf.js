console.log('HERE');

define(['lib/vendor/text!lib/common/paths.json'], function (paths) {

    'use strict';

console.log('THERE');
    paths = JSON.parse(paths);

    var env = 'server';
    var needle = '/{env}/';
    var replace = '/' + env + '/';
    var serverPaths = {};

    for (var k in paths.common) { // update env specific implementation paths
        paths.common[k] = paths.common[k].replace(needle, replace);
    }
    for (k in paths[env]) { // merge env specific paths
        paths.common[k] = paths[env][k];
    }

    return {
        environments: [{browserName: 'chrome'}],

        suites: ['test/unit/isomorphic/common/resolver/route'],

        excludeInstrumentation: /^(?:test|node_modules|lib\/vendor)\//,

        useSauceConnect: false,

        useLoader: {
            'host-node': 'requirejs',
            'host-browser': 'node_modules/dojo/dojo.js'
        },

        loader: {
            paths: paths.common,
            map: {
                intern: {
                    dojo: 'intern/node_modules/dojo',
                    chai: 'intern/node_modules/chai/chai'
                }
            }
        },

        webdriver: {
            host: 'localhost',
            port: 4444
        }
    };

});
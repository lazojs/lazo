define(['intern/dojo/node!fs', 'intern/dojo/node!path', 'test/mocks/lazo'], function (fs, path, lazo) {

    'use strict';

    var paths = JSON.parse(fs.readFileSync('lib/common/resolver/paths.json'));
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

    try {
        window.LAZO = lazo;
    } catch (err) {
        global.LAZO = lazo;
    }

    return {
        environments: [{browserName: 'chrome'}],

        suites: [
            'test/unit/client-server/common/resolver/route',
            'test/unit/client-server/common/resolver/file',
            'test/unit/client-server/common/resolver/assets',
            'test/unit/client-server/common/resolver/component',
            'test/unit/client-server/common/utils/handlebarsEngine',
            'test/unit/client-server/common/utils/model',
            'test/unit/client-server/common/utils/template',
            'test/unit/client-server/common/logger',
            // 'test/unit/client-server/common/renderer'
        ],

        excludeInstrumentation: /^(?:test|node_modules|lib\/vendor)\//,

        useSauceConnect: false,

        useLoader: {
            'host-node': 'requirejs',
            'host-browser': 'node_modules/requirejs/require.js'
        },

        loader: {
            paths: paths.common,
            map: {
                intern: {
                    dojo: 'intern/node_modules/dojo',
                    chai: 'intern/node_modules/chai/chai'
                },
                // lazo
                '*': {
                    'l': 'lib/server/loader.js',
                // mocks
                request: 'test/mocks/request',
                'continuation-local-storage': 'test/mocks/continuation-local-storage',
                }
            }
        },

        webdriver: {
            host: 'localhost',
            port: 4444
        }
    };

});
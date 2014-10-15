define(['intern/dojo/text!lib/common/resolver/paths.json', 'test/mocks/lazo'], function (paths, lazo) {

    'use strict';

    paths = JSON.parse(paths);

    try {
        window.LAZO = lazo;
    } catch (err) {
        global.LAZO = lazo;
    }
    LAZO.app.isServer = false;
    LAZO.app.isClient = true;

    if (!console) { // stub out for win9
        console = {
            log: function () {},
            info: function () {},
            error: function () {},
            warn: function () {},
            debug: function () {}
        };
    }

    var needle = '/{env}/';
    var serverPaths = {};
    var env = LAZO.app.isServer ? 'server' : 'client';
    var replace = '/' + env + '/';

    for (var k in paths.common) { // update env specific implementation paths
        paths.common[k] = paths.common[k].replace(needle, replace);
    }
    for (k in paths[env]) { // merge env specific paths
        paths.common[k] = paths[env][k];
    }

    return {

        proxyPort: 9000,

        proxyUrl: 'http://localhost:9000/',

        capabilities: {
            'selenium-version': '2.40.0'
        },

        environments: [
            { browserName: 'internet explorer', version: '11', platform: 'Windows 8.1' },
            { browserName: 'internet explorer', version: '10', platform: 'Windows 8' },
            { browserName: 'internet explorer', version: '9', platform: 'Windows 7' },
            { browserName: 'firefox', version: '28', platform: [ 'OS X 10.9', 'Windows 7', 'Linux' ] },
            { browserName: 'chrome', version: '34', platform: [ 'OS X 10.9', 'Windows 7', 'Linux' ] },
            { browserName: 'safari', version: '6', platform: 'OS X 10.8' },
            { browserName: 'safari', version: '7', platform: 'OS X 10.9' }
        ],

        tunnel: 'SauceLabsTunnel',

        excludeInstrumentation: /^(?:test|node_modules|lib\/vendor)\//,

        useLoader: {
            'host-browser': '../../node_modules/requirejs/require.js'
        },

        loader: {
            paths: paths.common,
            map: {
                intern: {
                    dojo: 'intern/node_modules/dojo',
                    chai: 'intern/node_modules/chai/chai'
                },
                '*': {
                    // testing libs
                    sinon: '../../node_modules/sinon/lib/sinon.js',
                    'sinon-chai': '../../node_modules/sinon-chai/lib/sinon-chai.js'
                }
            }
        }

    };

});
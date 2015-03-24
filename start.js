var fs = require('fs');
var path = require('path');
var lazoPath = path.dirname(module.filename);
var os = require('os');

function setEnv(options) {
    process.env['BASE_PATH'] = lazoPath;
    process.env['BASE_REPO_DIR'] = path.join(lazoPath, 'base');
    process.env['LAZO_VERSION'] = options.version;
    process.env['FILE_REPO_DIR'] = options.app_dir;
    process.env['PORT'] = options.port;

    for (var k in options) {
        process.env[k.toUpperCase()] = options[k];
    }
}

function daemon() {
    var fsx = require('fs-extra');
    var forever = require('forever');

    fsx.mkdirs(lazoPath + '/logs', function (err) {
        if (!err) {
            forever.load({ root: lazoPath + '/logs', pidPath: lazoPath });
            forever.startDaemon('./lib/server/app.js', {
                logFile: 'lazo.log',
                pidFile: 'lazo.pid',
                errFile: 'lazo.err',
                sourceDir: lazoPath,
                a: true
            });
        } else {
            console.error(err);
        }
    });
}

module.exports = function (options) {
    setEnv(options);
    if (options.daemon) {
        return daemon();
    }

    console.log('Starting Lazo! Please wait...');
    // starts application server
    var lazo = require('./lib/server/app.js');
}
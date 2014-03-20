// starts lazo
function getAppConf() {
    var appPath = path.normalize(process.env['LAZO_PATH'] + '/application');
    var serverConfPath = path.normalize(appPath + '/server.json');
    var serverConf = fs.existsSync(serverConfPath) ? fs.readFileSync(serverConfPath) : '';
    var commonConfPath = path.normalize(appPath + '/common.json');
    var commonConf = fs.existsSync(commonConfPath) ? fs.readFileSync(commonConfPath) : '';

    if (serverConf) {
        try {
            serverConf = JSON.parse(serverConf);
        } catch (e) {
            console.log('Error reading server.json: ' + e);
            process.exit(code=0);
        }
    }

    if (commonConf) {
        try {
            commonConf = JSON.parse(commonConf);
        } catch (e) {
            console.log('Error reading common.json: ' + e);
            process.exit(code=0);
        }
    }
}

// run lazo as daemon
function daemon() {
    var fsx = require('fs-extra');
    var forever = require('forever');

    fsx.mkdirs(process.env['LAZO_PATH'] + '/logs', function (err) {
        if (!err) {
            forever.load({ root: lazoPath + '/logs', pidPath: lazoPath });
            forever.startDaemon('lib/server/app.js', {
                logFile: 'lazo.log',
                pidFile: 'lazo.pid',
                errFile: 'logs/lazo.err',
                sourceDir: process.env['LAZO_PATH'],
                a: true
            });
            console.log('Started Lazo! on port ' + process.env['PORT']);
        } else {
            console.error(err);
        }
    });
}

modules.export = function (argv) {
    if (argv.d || argv.daemon) {
        daemon();
    }
};
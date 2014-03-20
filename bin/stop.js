modules.export = function (argv) {
    var fs = require('fs');
    var pidFilePath = path.normalize(process.env['LAZO_PATH'] + '/lazo.pid');
    var port = process.env['PORT'];
    if (fs.existsSync(pidFilePath)) {
        var pid = fs.readFileSync(pidFilePath);
        // TODO: kill process
        return console.log('Stopped Lazo on port ' + port);
    }

    console.log('Cannot stop Lazo. Lazo is not running on port ' + port);
};
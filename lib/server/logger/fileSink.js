/*global __dirname:false*/

define(['underscore', 'fs', 'moment', 'os', 'path', 'util'], function (_, fs, moment, os, path, util) {

    var DEFAULT_FILE = path.join(process.cwd(), 'lazojs.log');

    var MB = 1024 * 1024;

    var DEFAULT = {
        file: DEFAULT_FILE,
        maxSize: 100 * MB,
        roll: true
    };

    var isSameDay = function (a, b) {
        return a.getUTCFullYear() === b.getUTCFullYear() &&
            a.getUTCMonth() === b.getUTCMonth() &&
            a.getUTCDate() === b.getUTCDate();
    };

    var FileSink = function (options) {

        var _options = _.defaults({}, options, DEFAULT);

        // Check if directory exists

        if (!fs.existsSync(path.dirname(_options.file))) {
            throw new Error('Given path does not exist.');
        }

        // Check if can write file

        fs.appendFileSync(_options.file, os.EOL);

        var lastModified = null;

        return function (message) {
            var now = new Date();

            if (_options.roll && lastModified && !isSameDay(lastModified, now)) {
                var rolled = util.format('%s.%s', _options.file, moment(now).utc().format('YYYY-MM-DD'));

                if (!fs.existsSync(rolled)) {
                    fs.renameSync(_options.file, rolled);
                }
            }

            fs.appendFileSync(_options.file, message + os.EOL);

            lastModified = now;
        };
    };

    return FileSink;

});

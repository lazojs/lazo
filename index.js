var _ = require('lodash');
var commands = {
    start: require('./start'),
    stop: require('./stop'),
    version: require('./version')
}

module.exports = function (cmd, options) {
    if (cmd === 'version') {
        return commands.version();
    }

    commands[cmd](_.extend(options || {}, { version: commands.version() }));
};
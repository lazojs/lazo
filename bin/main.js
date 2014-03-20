var argv = require('minimist')(process.argv.slice(2));
var env = require('./env.js');
var command;
var commands = {

    start: function () {
        var start = require('./start.js');
        start(argv);
    },

    stop: function () {
        var stop = require('./stop.js');
        stop(argv);
    },

    create: function () {

    }

};

if (!(command = commands[argv._[0]])) {
    console.log('Lazo command ' + argv._[0] + ' does not exist.');
}

env(argv);
command();

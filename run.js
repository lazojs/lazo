var fs = require('fs');
var path = require('path');
var lazoPath = path.dirname(module.filename);
var os = require('os');
var lazo = require('./index.js')
var args = parseArgs();

// helper functions
function getAppDir() {
    var fileRepo = args._[1] ? path.resolve(args._[1]) : undefined;
    return fileRepo && fs.existsSync(fileRepo) ? fileRepo : 0;
}

function parseArgs() {
    return require('yargs')
        .alias('c', 'cluster')
        .alias('v', 'version')
        .alias('d', 'daemon')
        .alias('p', 'port')
        .default('port', '8080')
        .alias('r', 'robust')
        .boolean(['d', 'r'])
        .string(['p', 'c'])
        .argv;
}

// get the options for a lazo command
function getStartEnvOptions() {
    var options = {};

    for (var k in args) {
        switch (k) {
            case 'daemon':
            case 'robust':
                options[k] = args[k] === true ? '1' : '0';
                break;
            case 'cluster':
                options[k] = args[k] ? args[k] : os.cpus().length;
                break;
            case 'port':
                options[k] = args[k];
                break;
        }
    }

    return options;
}

// lazo --help [command]
function help(command) {
    switch (command) {
        case 'start':
            console.log('\nUsage: lazo start app_dir -c [num] -d -p [num]\n');
            console.log('Options:\n');
            console.log('app_dir [required] application directory');
            console.log('-c [optional] cluster, value [optional]\n');
            console.log('-d [optional] daemonize process using forever\n');
            console.log('-p [optional] port, value [required]\n');
            break;
        case 'stop':
            console.log('\nUsage: lazo stop\n');
            break;
        default:
            console.log('\nUsage: lazo --help command\n');
            console.log('Available commands: start stop\n');
            console.log('Options:\n');
            console.log('command [optional]\n');
            break;
    }
}

// entry point
function main() {
    if (args._.length) {
        switch (args._[0]) {
            case 'start':
                args.app_dir = getAppDir();
                lazo('start', args);
                break;
            case 'stop':
                lazo('stop', args);
                break;
            default:
                help();
                break;
        }
    } else {
        if (args.version) {
            console.log('v' + lazo('version'));
        } else if (args.help) {
            help(args.help);
        } else {
            help();
        }
    }
}

module.exports = main;
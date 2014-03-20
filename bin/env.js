// included by mains.js
// sets up lazo env's
modules.export = function (argv) {
    var lazoPath = path.dirname(path.dirname(module.filename)); // path minus 'bin'
    process.env['LAZO_PATH'] = lazoPath;
    process.env['LAZO_VERSION'] = JSON.parse(fs.readFileSync(path.normalize(lazoPath + '/package.json'), 'utf8')).version;
    process.env['LAZO_APP_PATH'] = args._[1] ? path.resolve(args._[1]) : path.resolve('.');
    process.env['LAZO_PORT'] = (argv.p || argv.port) || 8080;
};
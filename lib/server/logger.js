var winston = require('winston'),
    util = require("util");

// do it only once
if(!winston.transports.CustomerLogger){
// add custom logger to print out to error stream only
var CustomLogger = winston.transports.CustomerLogger = function (options) {
    this.name = 'CustomerLogger';
    this.level = options.level || 'info';
};
util.inherits(CustomLogger, winston.Transport);
CustomLogger.prototype.name = 'CustomerLogger'; // reset because util.inherits overwrites the original setting in constructor
CustomLogger.prototype.log = function (level, msg, meta, callback) {
    console.error(new Date().toISOString() + " - "  + level + ": " + msg);
    callback(null, true);
};
}

// Create out own instance of the logger to avoid someone directly accessing winston and changing things
var wLogger = new (winston.Logger)({
    transports: [
        new (winston.transports.CustomerLogger)({ level: 'error' })
    ]
});

wLogger.exitOnError = false;


var lazoLogLevels = {
    levels: {
        debug: 0,
        info: 1,
        warn: 2,
        error: 3
    }
};

wLogger.setLevels(lazoLogLevels.levels);

/**
 The logger

 @class logger
 @static
 **/
var logger = {
    setFileLogging : function(level, file) {
        level = level?level:"error";
        wLogger.add(winston.transports.File, {
            "level" : level,
            "filename" : file,
            "json" : false,
            "timestamp" : true,
            "handleExceptions" : true,
            "exitOnError": false
        });
    },
    setConsoleLogging : function(level) {
        this.logLevel = lazoLogLevels.levels[level];
        if (level) {
            wLogger.add(winston.transports.CustomerLogger, {
                "level" : level,
                "json" : false,
                "timestamp" : true,
                "handleExceptions" : true,
                "exitOnError": false
            });
        } else {
            wLogger.remove(winston.transports.CustomerLogger);
        }
    },
    setServer: function(server){
        this.server = server;
    },


    /**
     * Static logging method to log the message with the provided level and metadata
     * @method log
     * @param {String} level error, warn, info, debug
     * @param {String} method The method currently being logged
     * @param {String} msg The message
     * @param {Object} obj
     */
    log: function(level, method, msg, obj, req) {
        var logMsg = [new Date().toUTCString()];
        if(method) {
            logMsg.push(method);
        }
        logMsg.push(msg);

        if(req && typeof req.log === "function"){
            var lvl = lazoLogLevels.levels[level];
            if(lvl >= this.logLevel){
                req.log(level, logMsg);
            }
        }else if(this.server && typeof this.server.log === "function"){
            var lvl = lazoLogLevels.levels[level];
            if(lvl >= this.logLevel){
                this.server.log(level, logMsg);
            }
        }else{
            wLogger.log(level, logMsg, obj);
        }
    }
};

module.exports = logger;
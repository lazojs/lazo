/* automatically generated by JSCoverage - do not edit */
try {
  if (typeof top === 'object' && top !== null && typeof top.opener === 'object' && top.opener !== null) {
    // this is a browser window that was opened from another window

    if (! top.opener._$jscoverage) {
      top.opener._$jscoverage = {};
    }
  }
}
catch (e) {}

try {
  if (typeof top === 'object' && top !== null) {
    // this is a browser window

    try {
      if (typeof top.opener === 'object' && top.opener !== null && top.opener._$jscoverage) {
        top._$jscoverage = top.opener._$jscoverage;
      }
    }
    catch (e) {}

    if (! top._$jscoverage) {
      top._$jscoverage = {};
    }
  }
}
catch (e) {}

try {
  if (typeof top === 'object' && top !== null && top._$jscoverage) {
    _$jscoverage = top._$jscoverage;
  }
}
catch (e) {}
if (typeof _$jscoverage !== 'object') {
  _$jscoverage = {};
}
if (! _$jscoverage['client/logger.js']) {
  _$jscoverage['client/logger.js'] = [];
  _$jscoverage['client/logger.js'][1] = 0;
  _$jscoverage['client/logger.js'][2] = 0;
  _$jscoverage['client/logger.js'][7] = 0;
  _$jscoverage['client/logger.js'][9] = 0;
}
_$jscoverage['client/logger.js'].source = ["define([], function () {","    \"use strict\";","","    /**","     * Create a logger and return it. The logger will log to the console.","     */","    return {","        log: function (level, method, msg, obj) {","            console.log('[' + level + ']:(' + method + '): ' + msg);","        }","    }","","});"];
_$jscoverage['client/logger.js'][1]++;
define([], (function () {
  _$jscoverage['client/logger.js'][2]++;
  "use strict";
  _$jscoverage['client/logger.js'][7]++;
  return ({log: (function (level, method, msg, obj) {
  _$jscoverage['client/logger.js'][9]++;
  console.log(("[" + level + "]:(" + method + "): " + msg));
})});
}));
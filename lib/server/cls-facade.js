define(['underscore'], function (_) {

  'use strict';

  var namespaceObj = {
    store: {},
    get: function (key) {
      return this.store[key];
    },
    set: function (key, val) {
      return this.store[key] = val;
    },
    run: function (fn) {
      return fn.call(this);
    }
  };

  return {
    createNamespace: function (name) {
      var domain = require('domain');
      var active = domain.active;
      var namespace = _.extend({}, namespaceObj);

      if (active) {
        if (active[name]) {
          return active[name];
        }

        active[name] = namespace;
      }

      return namespace;
    },

    getNamespace: function (name) {
      var domain = require('domain');
      var active = domain.active;

      return (active && active[name]) || _.extend({}, namespaceObj);
    }
  };
});
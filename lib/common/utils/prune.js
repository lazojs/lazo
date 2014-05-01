define(['lazoModel'], function (LazoModel) {

    'use strict';

    function getRefs(ctl, refs) {
        var ctx = ctl.ctx;
        var models = ctx.models;
        var collections = ctx.collections;
        var k;
        var gid;
        var i = 0;
        var child;

        for (k in models) {
            gid = LazoModel._getGlobalId(models[k].name, models[k].params);
            refs[gid] = true;
        }

        for (k in collections) {
            gid = LazoModel._getGlobalId(collections[k].name, collections[k].params);
            refs[gid] = true;
        }

        if (ctl.children) {
            for (k in ctl.children) {
                child = ctl.children[k];
                for (i = 0; i < child.length; i++) {
                    getRefs(child[i], refs);
                }
            }
        }

        return refs;
    }

    return function (ctl) {
        var refs = getRefs(ctl, {});
        var modelInstances = ctl.ctx._rootCtx.modelInstances;

        for (var k in modelInstances) {
            if (!refs[k]) {
                delete modelInstances[k];
            }
        }
    };

});
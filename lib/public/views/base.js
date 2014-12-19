define(['flexo', 'lazoViewMixin', 'underscore'], function (flexo, mixin, _) {

    'use strict';

    return flexo.View.extend(_.extend({}, mixin));

});

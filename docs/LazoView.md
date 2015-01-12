## LazoView

LazoViews extend [flexo.View](http://backbonejs.org/#Model).

```js
define(['lazoView'], function (LazoView) {

    return LazoView.extend({

        doSomething: function () {
            return 'something';
        }

    });

});
```

### `constructor(options)`

Creates a new `LazoView` instance.
You may override it if you need to perform some initialization while the instance is created.
The `LazoModel` constructor must be called though.

Calls the [flexo.View.constructor](http://backbonejs.org/#Model-constructor).

#### Arguments
1. `attributes` *(Object)*: See [Backbone.Model.constructor](http://backbonejs.org/#Model-constructor).
1. `options` *(Object)*: See [Backbone.Model.constructor](http://backbonejs.org/#Model-constructor).
    - `name` *(String)*: Model name.
    - `params` *(Object)*: A hash of name-value pairs used in url substitution.
    - `ctx` *(Object)*: The current context for the request. See *TODO: ADD LINK*.

#### Example
```js
var attributes = { data: 'abc' };
var options = {
    name: 'LazoModel',
    params: {
        id: 123
    },
    ctx: {}
};

new LazoModel(attributes, options);
```
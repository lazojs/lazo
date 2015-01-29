## LazoWidget

The `LazoWidget` interface is designed to work within the Lazo rendering life cycle on the client and the server. As such a
widget's `render` implementation must function on the client and the server.

```js
define(['lazoWidget', 'underscore'], function (LazoWidget, _) {

    'use strict';

    var template = _.template('<p>Hello! My name is <%='data-name'%></p>');

    return LazoWidget.extend({

        render: function (options) {
            options.success(template(this.attributes));
        }

    });

});
```

Widget constructors are defined in a `LazoView` `widgets` property. The values can be `LazoWidget` classes or the paths to the widget modules:

```js
define(['lazoView', 'lazoWidget'], function (LazoView, LazoWidget) {

    'use strict';

    return LazoView.extend({

        doSomething: function () {
            return 'something';
        },

        widgets: {
            foo: LazoWidget.extend({
                render: function (options) {
                    options.success('I am a widget!')
                }
            }),
            bar: 'app/widgets/bar/index'
        }

    });

});
```

Widgets are then declared in the `LazoView` template:

```html
<p>I am a view template.</p>
<div lazo-widget="foo" data-something="{{somevalue}}"></div>
<!-- iterate over a collection and create multiple widget instances -->
{{#each bars}}
    <div lazo-widget="bar" data-somethingelse="{{anothervalue}}"></div>
{{/each}}
```

When widgets are created the instances are then added to the `LazoView` `widgetInstances` property. In the case above the property would look
something like the following:

```js
// view instance
{
    widgetInstances: {
        foo: [instance],
        bar: [instance1, instance2, ...]
    }
}
```

### Widget Attibutes
Widget container markup attributes are passed to the `LazoWidget` constructor and assigned to the instance `attributes` property. Attribute
values can be used to resolve to context values for the component that instantiated the `LazoView` that owns the widget instance. This done
using the "$" in an attribute value:

```html
<div lazo-widget="foo" data-status="$.status">
```

This would map `<instance>.attributes['data-status']` to `ctx.status`. By default a `LazoWidget` will attempt to coerce values that do not
resolve to a context property. See [`attrValCoercion`](#attrvalcoercion) for further details.

### `constructor(attributes)`

Creates a new `LazoWidget` instance.
You may override it if you need to perform some initialization while the instance is created.
The `LazoWidget` constructor must be called though.

Calls the [Backbone.Model.constructor](http://backbonejs.org/#Model-constructor).

*Note - When rendering a route response Lazo automatically creates widget instances and resolves instance atrributes.*

#### Arguments
1. `attributes` *(Object)*: Attributes delcared in the widget container markup.

#### Example
```js

new LazoWidget(attributes);
```

### `initialize()`

Called during `LazoWidget` construction.
Used to execute initialization logic when the instance is created.

#### Example
```js
define(['lazoWidget'], function (LazoWidget) {

    'use strict';

    return LazoWidget.extend({

        initialize: function () {
            // initialization logic
        }

    });

});
```

### `render(options)`

Render markup for a widget.

1. `options` *(Object)*: Options for render.
    - `success` *(Function)*: Function to call when successful.
    - `error` *(Function)*: Function to call if there is a failure.

#### Example
```js
define(['lazoWidget'], function (LazoWidget) {

    'use strict';

    return LazoWidget.extend({

        render: function (options) {
            options.success('I am a widget!');
        }

    });

});
```

### `afterRender(options)`

Called after a widget is attached to the DOM.

*Note - Only called on the client.*

1. `options` *(Object)*: Options for render.
    - `success` *(Function)*: Function to call when successful. Removes widget container css class `rendering` and adds `rendered`
    - `error` *(Function)*: Function to call if there is a failure.

#### Example
```js
define(['lazoWidget'], function (LazoWidget) {

    'use strict';

    return LazoWidget.extend({

        afterRender: function (options) {
            // do something
            options.success();
        }

    });

});
```

### `bind(el)`

Called when a widget is attached to the DOM.

*Note - Only called on the client.*

1. `el` *(Object)*: Widget containing element.

#### Example
```js
define(['lazoWidget'], function (LazoWidget) {

    'use strict';

    return LazoWidget.extend({

        bind: function (el) {
            this.clickHandler = el.addEventListener('click', function (e) {
                // do seomthing
            }, false);
        }

    });

});
```

### `unbind(el)`

Called when a widget is detached from the DOM.

*Note - Only called on the client.*

1. `el` *(Object)*: Widget containing element.

#### Example
```js
define(['lazoWidget'], function (LazoWidget) {

    'use strict';

    return LazoWidget.extend({

        unbind: function (el) {
            el.removeEventListener('click', this.clickHandler, false)
        }

    });

});
```

### `attrValCoercion`

Instructs widget whether or not to coerce attribute data types. Default value is `true`.

```html
<div lazo-widget="foo" data-a="true" data-b="1.87" data-c="{ foo: true, bar: 'I am a string' }" data-d="[1, 2, 3]">
```

The attributes in the above markup would be converted to the following values:

* *data-a:* Boolean
* *data-b:* Number
* *data-c:* Object
* *data-d:* Array
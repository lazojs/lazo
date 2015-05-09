A LazoWidget can be used to integrate a 3rd party library into the Lazo rendering life cycle. This allows you to encapsulate the creation and deletion of a widget in itself keeping your view layer clean. A LazoWidget is intended to be agnostic of business logic.

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

        widgetDefinitions: {
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

When widgets are created the instances are then added to the `LazoView` `widgets` property or the `LazoWidget` `children` property
if the widget is a child of another widget. In the case above the property would look something like the following:

```js
// view instance
{
    widgets: {
        foo: [instance],
        bar: [instance1, instance2, ...]
    }
}
```

### Widget Composition
Widgets can be children of other widgets:

```html
<p>I am view A.</p>
<div lazo-widget="B">
    <div lazo-widget="C"></div>
</div>
```

In this case widget `C` would attempt to resolve its definition to `B.widgetDefinitions.C`. If that failed then it would attempt
to resolve to a definition in the parent view, `A.widgetDefinitions.C`. If it cannot resolve to a defintion then error is
passed back up the callback chain.

```js
define(['lazoView', 'lazoWidget'], function (LazoView, LazoWidget) {

    'use strict';

    return LazoView.extend({

        widgetDefinitions: {
            B: LazoWidget.extend({
                render: function (options) {
                    options.success('I am a widget B!')
                },
                widgetDefinitions: {
                    C: LazoWidget.extend({
                        render: function (options) {
                            options.success('I am a widget C!')
                        }
                    })
                }
            })
        }

    });

});
```

### Widget Attibutes
Widget container markup attributes are passed to the `LazoWidget` constructor and assigned to the instance `attributes`
property. Attribute values can be used to resolve to context values for the component that instantiated the `LazoView` that
owns the widget instance. This done using the "$" in an attribute value:

```html
<div lazo-widget="foo" data-status="$.status">
```

### Widget Events
[Backbone.Events](http://backbonejs.org/#Events) is mixed into `LazoWidget`.

This would map `<instance>.attributes['data-status']` to `ctx.status`. By default a `LazoWidget` will attempt to coerce values that do not resolve to a context property. See [`attrValCoercion`](#attrvalcoercion) for further details.

### CSS Classes
Lazo adds CSS classes to eidget elements at different times in the life cycle:

* "lazo-rendering": Markup is generated, but not in the DOM or not finished being inserted into the DOM
* "lazo-rendered": Markup is generated, in the DOM, and `afterRender` `options.success` has been called
* "lazo-detached": Markup is in the DOM, but `attach` has not been called
* "lazo-attached": Markup is in the DOM and `attach` has been called

### Setting Widget States
[LazoState](#LazoState) is mixed into LazoWidget and can be used to set different states on a widget.

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

#### Arguments
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

#### Arguments
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

### `attach(el)`

Called when a widget is attached to the DOM.

*Note - Only called on the client.*

#### Arguments
1. `el` *(Object)*: Widget containing element.

#### Example
```js
define(['lazoWidget'], function (LazoWidget) {

    'use strict';

    return LazoWidget.extend({

        attach: function (el) {
            this.clickHandler = el.addEventListener('click', function (e) {
                // do seomthing
            }, false);
        }

    });

});
```

### `attached()`

Called after a widget has been attached to the DOM.

*Note - Only called on the client.*

#### Arguments
1. `el` *(Object)*: Widget containing element.

#### Example
```js
define(['lazoWidget'], function (LazoWidget) {

    'use strict';

    return LazoWidget.extend({

        attached: function () {
            this.trigger(this.name + ':attached', this);
        }

    });

});
```

### `detach(el)`

Called when a widget is detached from the DOM.

*Note - Only called on the client.*

#### Example
```js
define(['lazoWidget'], function (LazoWidget) {

    'use strict';

    return LazoWidget.extend({

        detach: function (el) {
            el.removeEventListener('click', this.clickHandler, false);
        }

    });

});
```

### `detached()`

Called after a widget has been detached from the DOM.

*Note - Only called on the client.*

#### Example
```js
define(['lazoWidget'], function (LazoWidget) {

    'use strict';

    return LazoWidget.extend({

        detached: function () {
            this.trigger(this.name + ':detached', this);
        }

    });

});
```

### `createWidget()`

Used to programatically create a widget instance. Creates an instance of a widget. Renders widget in `el`
if `el` does not contain children. Attaches widget to the `el`. Pushes widget instance to name array in `children`
object of the parent widget.

*Note - Should only called on the client.*

#### Arguments
1. `el` *(Object)*: Element to which to attach widget.
2. `name` *(String)*: Name of widget definition to which to resolve.
3. `options` *(Object)*:
    - `success` *(Function)*: Function to call when successful. Returns widget instance.
    - `error` *(Function)*: Function to call if there is a failure. Returns error object.
    - `attributes` *(Object)*: Attributes to be passed to widget upon creation.

#### Example
```js
<LazoWidget>.createWidget(this.el.querySelector('.some-class'), 'widget-def-key', {
    success: function (widget) {
        // do something with newly create widget instances
    },
    error: function (err) {
        // handle error
    }
});
```

### `getWidgetByEl(el)`

Get a widget instance by an element.

#### Arguments
1. `el` *(Object)*: Widget element.

#### Returns
*(Object)*: Widget instance

#### Example
```js
var el = <LazoWidget>.el.querySelector('#some-id');
var widget = <LazoWidget>.getWidgetByEl(el);
```

### `getWidgetsByName(name)`

Get a widget instance by an element.

#### Arguments
1. `name` *(String)*: Widget name.

#### Returns
*(Array)*: Widget instances

#### Example
```js
var widgets = <LazoWidget>.getWidgetByEl('foo');
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

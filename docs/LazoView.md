LazoViews extend [flexo.View](https://github.com/lazojs/flexo/blob/master/docs/index.md#flexoview). They are designed
to run within the Lazo rendering life cycle. The following properties and methods should **not** be overridden:

* `hasTemplate`
* `eventNameSpace`
* `attributeNameSpace`
* `getAttributes`
* `augment`

All of the properties and methods can be overridden and will function within the Lazo rendering life cycle allowing
you to plugin any rendering solution that is environment agnostic. For more information on the different properties
and methods please consult the flexo [documentation](https://github.com/lazojs/flexo/blob/master/docs/index.md#flexoview).

```js
define(['lazoView'], function (LazoView) {

    return LazoView.extend({

        doSomething: function () {
            return 'something';
        }

    });

});
```

### CSS Classes
Lazo adds CSS classes to view elements at different times in the life cycle:

* "lazo-detached": Markup is in the DOM, but `attach` has not been called
* "lazo-attached": Markup is in the DOM and `attach` has been called

### Setting View States
[LazoState](#LazoState) is mixed into LazoView and can be used to set different states on a view.

### `[viewDefinitions]`

An object that contains property names that contain paths to the child view definitions. When a definition
is resolved the instance is stored in the parent view's `children` object using the definition property
name.

#### Example
```js
define(['lazoView'], function (LazoView) {

    return LazoView.extend({

        viewDefinitions: {
            foo: 'app/views/foo'
        }

    });

});
```

### `createWidget()`

Used to programatically create a widget instance. Creates an instance of a widget. Renders widget in `el`
if `el` does not contain children. Attaches widget to the `el`. Pushes widget instance to the correspondingly
named array in `widgets` object of the parent widget.

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
<LazoView>.createWidget(this.el.querySelector('.some-class'), 'widget-def-key', {
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
var el = <LazoView>.el.querySelector('#some-id');
var widget = <LazoView>.getWidgetByEl(el);
```

### `getWidgetsByName(name)`

Get a widget instance by an element.

#### Arguments
1. `name` *(String)*: Widget name.

#### Returns
*(Array)*: Widget instances

#### Example
```js
var widgets = <LazoView>.getWidgetByEl('foo');
```
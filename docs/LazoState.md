LazoState is a mixin that adds the ability to set CSS state classes on [LazoView](#LazoView)
and [LazoWidget](#LazoWidget) instances:

* "lazo-focus"
* "lazo-disabled"
* "lazo-visible"
* "lazo-hidden"

### `setState(state, on)`

Set a CSS state class on a view or widget.

#### Arguments
1. `state` *(String)*: Name of the state to set.
2. `on` *(Boolean)*: Toggle the state on or off.

#### Example
```js
// sets "lazo-focus" class on widget element
<LazoWidget>.setState('focus', true);

// removes "lazo-disabled" class from a view element
<LazoView>.setState('disabled', false);
```

# LazoController

In LazoJS, controllers are optional, but the `LazoController` class must be [**extended**](#extend) for implementing the business logic of a new component.

A controller is where routing action handlers must be implemented and it is also the recommended place to keep view action handlers. Having *fat controllers* and *thin views* is a practice that should facilitate testing, since views are typically more difficult to test.

```javascript
define(['lazoCtl'], function (LazoController) {

  'use strict';

  // Call the extend static method
  return LazoController.extend({

    // Example of routing action handler
    index: function (options) {
      var self = this;

      // Load a model
      self.loadModel('myModel', {
        error: options.error,

        success: function (myModel) {
          // Add model instance to the component's context object
          self.ctx.models.myModel = myModel;

          // Call the router callback, passing the name if the view to be rendered
          options.success('index');
        }
      });
    },

    // Example of view action handler
    save: function (data, options) {
      // Save the data provided by the view into the model instance and all the way to the server
      this.ctx.models.myModel.save(data, options);
    }

  });

});
```

## `addChild(container, cmpName, options)`

Adds a child component into the given `container`.

### Arguments

1. `container` *(String)*: A component container name, it has to match the `lazo-cmp-container` attribute value from an existing tag in the current view.
2. `cmpName` *(String)*: The name of component to be instantiated and added inside the given container.
3. `[options]` *(Object)*: The `options` hash.
  - `[ctx]` *(Object)*: The context object to be passed to the child component.
  - `[error]` *(Function)*: Called if an error occurs, it must implement the `function(error)` interface.
      - `error` *(Error)*: An `Error` instance.
  - `[success]` *(Function)*: Called after the child component has been successfully instantiated and added to the current view, it must implement the `function(childController)` interface.
    - `childController` *(Object)*: The child controller instance.

### Example

First, include a component container into current's view markup:

```html
<div lazo-cmp-container="foo"><!-- CHILDREN GO HERE --></div>
```

Then, add a child component from the parent controller:

```javascript
this.addChild('foo', 'bar', {
  ctx: {
    params: this.ctx.params
  },
  error: function (error){
    console.log('Error while adding "bar" component into "foo" container...');
  },
  success: function (fooController){
    console.log('"bar" component was successfully added into "foo" container!');
  }
});
```

## `augmentCssLink(link)`

### Arguments

### Returns

### Example

## `augmentImportLink(link)`

### Arguments

### Returns

### Example

## `clearCookie(name, [options])`

Clears a cookie.

### Arguments

1. `name` *(String)*: The cookie name.
2.  `[options]` *(Object)*: An options hash.
  - `[domain]` *(String)*: The domain where the cookie is valid.
  - `[path]` *(String)*: The path where the cookie is valid.

### Example

```javascript
this.clearCookie('cart', {
  domain:'example.com',
  path:'/'
});

```

## `constructor(options)`

Creates a new controller instance. You may override it if you need to perform some initialization while the instance is created. The 'LazoController' constructor must be called though.

Consider overriding [`initialize`](#initialize) instead.

```javascript
var BaseController = LazoController.extend({
  constructor: function (options){
    this.createdOn = Date.now();
    return LazoController.apply(this, arguments);
  },
  createdOn: null
});
```

### Arguments

1. `options` *(Object)*: An options hash.
  - `name` *(String)*: The component name.

### Returns

A new controller instance.

## `create(cmpName, ctlOptions, options)`

### Arguments

### Returns

### Example

## `createCollection(collectionName, attributes, options)

### Arguments

### Returns

### Example

## `createModel(modelName, attributes, options)

### Arguments

### Returns

### Example

## `deserialize(ctl, options)`

### Arguments

### Returns

### Example

## <a name="extend"></a>`extend([properties], [classProperties])`

Creates a custom controller class.

### Arguments

1. `[properties]` *(Object)*: An object describing the methods and properties for every class instance.
2. `[classProperties]` *(Object)*: An object describing the **static** methods and  properties to be added to the custom controller constructor.

### Returns

*[Function]*: Returns a constructor function the custom controller class.

### Example

```javascript
var FooController = LazoController.extend({
  bar: 123,
  foo: function () {
    return 'foo';
  }
}, {
  baz: function () {
    return 'baz';
  },
  quux: 456
});

FooController.baz();    // 'baz'
FooController.quux;     // 456

var fooController = new FooController();

fooController.bar;      // 123
fooController.foo();    // 'foo'
```

## `getImport(relativePath)`

### Arguments

### Returns

### Example

## `getPageTitle()`

### Arguments

### Returns

### Example

## `getPath`

### Arguments

### Returns

### Example

## `getSharedData(key)`

### Arguments

### Returns

### Example

## <a name="initialize"></a>`initialize(options)`

Initialize the new controller instance. You may override it if you need to perform some initialization just after the instance is created.

```javascript
var BaseController = LazoController.extend({
  initialize: function (options){
    this.initOn = Date.now();
  },
  initOn: null
});
```

### Arguments

1. `options` *(Object)*: An options hash.
- `name` *(String)*: The component name.

## `index(options)`

### Arguments

### Returns

### Example

## `loadCollection(collectionName, options)`

### Arguments

### Returns

### Example

## `loadModel(modelName, options)`

### Arguments

### Returns

### Example

## `navigate(action, options)`

### Arguments

### Returns

### Example

## serialize

### Arguments

### Returns

### Example

## `setCookie(name, value, [options])`

### Arguments

1. `name` *(String)*: The cookie name.
2. `value` *(String)*: The cookie value
3.  `[options]` *(Object)*:
  - `domain` *(String)*:
  - `expires` *(Number)*:
  - `path` *(String)*:
  - `domain` *(String)*: The domain where the cookie is valid, it defaults to the domain of page where the cookie was created.
  - `path` *(String)*: The path where the cookie is valid, it defaults to the path of the page where the cookie was created.

### Returns

### Example

## setPageTitle

### Arguments

### Returns

### Example

## setSharedData

### Arguments

### Returns

### Example

## toJSON

### Arguments

### Returns

### Example

## transition

### Arguments

### Returns

### Example

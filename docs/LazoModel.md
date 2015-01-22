LazoModels extend [Backbone.Model](http://backbonejs.org/#Model). Lazo also has the concept of a proxy
layer – one for the client and one for the server. On the client it leverages a custom
[Backbone.sync](http://backbonejs.org/#Sync) that sends all requests through a tunnel end
point on the Lazo application server. On the server it either forwards the request directly
to an service end point or if a [LazoSyncher](LazoSyncher.md) exists for the model Lazo forwards
the request to the LazoSyncher.


```js
define(['lazoModel'], function (LazoModel) {

    return LazoModel.extend({

        doSomething: function () {
            return 'something';
        }

    });

});
```

### `constructor(attributes, options)`

Creates a new `LazoModel` instance.
You may override it if you need to perform some initialization while the instance is created.
The `LazoModel` constructor must be called though.

Calls the [Backbone.Model.constructor](http://backbonejs.org/#Model-constructor).

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


### `call(name, arguments, options)`

Calls the `name` method on the syncher, passing in `arguments` and `options`.

*Note - The syncher is a server only concept, so this will initiate a tunnel call.*

#### Arguments
1. `name` *(String)*: Name of function to call on the syncher.
1. `arguments` *(&#42;)*: Passed to the function as the first param.
1. `options` *(Object)*: Passed to the function as the second param.
    - `success` *(Function)*: Function to call when successful.
    - `error` *(Function)*: Function to call if there is a failure.

#### Example
```js
var method = 'checkName';
var arguments = 'Name';
var options = {
    success: function(){},
    error: function: function(){}
};

lazoModel.call(method, arguments, options);
```


### `save([attributes], [options])`

Override of [Backbone.Model.save](http://backbonejs.org/#Model-save).
Exact same functionality except when `options.persist` is false, it will no-op.

#### Arguments
1. `[attributes]` *(Object)*: Attributes to change prior to save.
1. `options` *(Object)*: Options for save. See [Backbone.Model.save](http://backbonejs.org/#Model-save).
    - `success` *(Function)*: Function to call when successful.
    - `error` *(Function)*: Function to call if there is a failure.
    - `[syncDateFromChildren]` *(Boolean)* When True the child models created via modelsSchema will update the parent object hierarchy with their data. Defaults to true.

#### Example
```js
var attributes = { name: 'Name' };
var options = {
    success: function(){},
    error: function: function(){}
};

lazoModel.save(attributes, options);
```


### `set(attributes, [options])`

Override of [Backbone.Model.set](http://backbonejs.org/#Model-set).

#### Arguments
1. `attributes` *(Object)*: Attributes to set.
1. `[options]` *(Object)*: Options for save. See [Backbone.Model.save](http://backbonejs.org/#Model-set).
    - `[syncDateToChildren]` *(Boolean)* When True any attribute is set that is the first part of a path in a modelsSchema locator, will update the child's model data. Defaults to true.


### `[modelsSchema]`

An array of object that provide a mechanism to parse object hierarchies into child LazoModels and LazoCollections.

#### schema *(Object)*
1. `name` *(String)*: Name of model or collection in the repository to use for this child object.
1. `locator` *(String)*: Path used to locate the data in the object hierarchy used to populate the data in the child model/collection.
1. `prop` *(String)*: The name of the property created in the parent object that is a reference to the model/collection instance.

#### Example
Given repo structure:
repo
|
|-- models
    |
    |-- parent
    |-- child
 
parent/model.js:    
```js
define(['lazoModel'], function (LazoModel) {

    return LazoModel.extend({

        modelsSchema: [
            {
                name: 'child',
                locator: 'foo.bar.baz',
                prop: 'theChildModel'
            }
        ]
    });

});
```   
 
And the given data for the parent/model is:
```js
{
    foo: {
        bar: {
            baz: {
                a: 'b'
            }
        }
    }
}
``` 
  
The parent model would have a property `theChildModel` which would be an instance of the `repo/models/child` model and have the attributes `a` which would have a value of `b`.
  

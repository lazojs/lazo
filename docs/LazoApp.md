`LazoApp` class provides a common set of apis that can be used at both client and server side. Your application has to extend `LazoApp` in `application.js` file. This is where you load environment specific configuration, set application level properties, and define application level CSS and JavaScript. Please check the Lazo Application Strucure for more information [LazoApplicationStrucutre](LazoApplicationStrucutre.md)

Example:
```javascript
define(['lazoApp'], function (LazoApp) {

    'use strict';

    return LazoApp.extend({

        css: ['/app/client/app.css'],

        js: ['/app/utils.js'],

        initialize: function (callback) {
            return callback();
        }

    });
```

You can access the Lazo App object using `LAZO.app` global variable.

### <a name="isClient"></a>`isClient`

Is set to true if the application is running in the browser (client side) else false

#### Example
```javascript

if(LAZO.app.isClient) {
  console.log("I am the client");  // run only at client side
} else {
  console.log("I am the server");  // run only at server side
}
```

### <a name="isServer"></a>`isServer`

Is set to true if the application is running in the server (client side)

#### Example
```javascript
if(LAZO.app.isServer) {
  console.log("I am the server"); // run only at server side
} else {
  console.log("I am the browser"); // run only at client side
}
```

### <a name="setData"></a>`setData(key, val, ctx)`

Stores Key-Value data in a given context which can be then accessed from both server and client side.


#### Arguments

- `key` *(String)*: The string key;
- `val` *(Object)*: The object to be stored and shared.
- `ctx` *(Object)*: The context object

#### Returns
*(Object)*: The application instance.

#### Example

```javascript
define(['lazoCtl'], function (Ctl) {
    'use strict';
    return Ctl.extend({
        index: function (options) {
            LAZO.app.setData('foo', {bar:'quux'}, this.ctx);
            // controller logic
            options.success(index);
        }
    });
});
```

### <a name="getData"></a>`getData(key, ctx)`

Retrieves shared Key-Value data from the context.


#### Arguments

- `key` *(String)*: The string key;
- `ctx` *(Object)*: The context object

#### Returns
*(Object)*: The data object

#### Example
```javascript
define(['lazoView'], function (LazoView) {
    'use strict';
    return LazoView.extend({
        initialize: function(options) {
            console.log("Foo = " + JSON.stringify(LAZO.app.getData('foo', this.ctl.ctx)));
        }
    });
});
```

### <a name="addRequestFilter"></a>`addRequestFilter(regex, func)`

Adds a filter to redirect routes that match the given regex to another location before executing an action assosciated with the route. A good use case is if an application requires authentication. A filter would look for the existence of a session cookie. If the cookie existed it would update the time stamp and Lazo would execute the component action for the
requested route by returning `undefined`. If the cookie were invalid then the filter would return the path to the
login page.

#### Arguments
- `regex` *(String)* : Regular expression for the route
- `func` *(Function)*: Filter function that must implement the interface 
    - `function (path, params, ctx, options)`
        - `[path]` *(String)*:
        - `[params]` *(Object*): The params hash, used in URL substitution
        - `[ctx]` *(Object)*: The context object
        - `[options]` *(Object)*: The options hash:
            - `[error]` *(Function)*: Called if an error occurs, it must implement the `function(error)` interface:
                - `error` *(Error)*: The `Error` instance
            - `[success]` *(Function)*: Called after the model instance has been successfully loaded, it must implement the `function(model)` interface:
                - `model` *(LazoModel)*: The model instance.

#### Returns
- *(Object)*: The Application instance

#### Example

> Filters are applied in the order they were entered for a given regular expression that matches a route. If multiple
regular expression keys are matched then the filters are applied in order matched and then in order of addition to
the matching regular expression key.

```javascript
LAZO.app.addRequestFilter('.*', function (path, params, ctx, options) {
    var sessionCookie = ctx.getCookie('session_token');

    // invalid session; user redirected to login route
    if (!sessionCookie && path !== 'login') {
        return options.sucess('/login');
    }

    // valid session
    // updated cookie
    ctx.setCookie('session_token', sessionCookie, {
        ttl: 60 * 60 * 1000,
        path: '/'
    });

    // return undefined; user continues to original route unless another
    // applied filter returns a redirect
    return options.success();
});
```

> If something went really, really wrong in a filter you can call `options.error(err)`. This
will trigger a 500 error and render the corresponding [error template](Error-Templates)

### <a name="addRoutes"></a>`addRoutes(routes)`

Adds routes to the LAZO routes.

#### Arguments

- `routes` *(Object)*: Lazo Routes Objects

#### Returns

- *(Object)*: The Application instance

#### Example

```javascript
    LAZO.app.addRoutes({
        "/url_path": {
            "component": "component_name",
            "bundle": "bundle_name",
        }});
```
> For more information on Lazo routes check [wiki] (https://github.com/lazojs/lazo/wiki/Configuration)

### <a name="navigate"></a>`navigate(ctx, routeName)`

Used to navigate to a different route at client or server side.

#### Arguments
- `ctx` *(Object)*: Context Object
- `routeName` *(String)*: new route

#### Example
```javascript
LAZO.app.navigate(this.ctl.ctx, "/new-route");
```

### <a name="loadModel"></a>`loadModel(modelName, options)`

Loads the lazo model. For more information on models refer to [LazoModel](LazoModel.md)

#### Arguments
- `modelName` *(String)*: The model name, it should match a model declared under the `models` directory;
- `[options]` *(Object)*: The options hash:
  - `[error]` *(Function)*: Called if an error occurs, it must implement the `function(error)` interface:
    - `error` *(Error)*: The `Error` instance;
  - `[params]` *(Object)*: The params hash, used in URL substitution;
  - `[success]` *(Function)*: Called after the model instance has been successfully loaded, it must implement the            `function(model)` interface:
    - `model` *(LazoModel)*: The model instance.
  - `[ctx]` *(Object)*: The context object 

#### Returns

*(Object)*: The Application instance

#### Example

```javascript
LAZO.app.loadModel('person', {
    error: function (error) {
        console.log('Oops...');
    },
    params: {
        id: 123 // See LazoModel for params usage
    },
    success: function (person) {
        console.log('Yay!');
    },
    ctx: this.ctl.ctx // Current context of the request
    });
```

### <a name="loadCollection"></a>`loadCollection(collectionName, options)`

Loads the lazo collection. For more information on models refer to [LazoCollection](LazoCollection.md)

#### Arguments
- `collectionName` *(String)*: The collection name, it should match a collection declared under the `models` directory
- `[options]` *(Object)*: The options hash:
  - `[error]` *(Function)*: Called if an error occurs, it must implement the `function(error)` interface:
    - `error` *(Error)*: The `Error` instance;
  - `[params]` *(Object)*: The params hash, used in URL substitution;
  - `[success]` *(Function)*: Called after the model instance has been successfully loaded, it must implement the            `function(model)` interface:
    - `model` *(LazoModel)*: The model instance.
  - `[ctx]` *(Object)*: The context object

#### Returns

*(Object)*: The Application instance

#### Example

```javascript
LAZO.app.loadCollection('people', {
    error: function (error) {
        console.log('Oops...');
    },
    params: {
        id: 123 // See LazoModel for params usage
    },
    success: function (people) {
        console.log('Yay!');
    },
    ctx: this.ctl.ctx // Current context of the request
    });
```

### <a name="createModel"></a>`createModel(modelName, attributes, options)`

Creates a new model instance.

#### Arguments

- `modelName` *(String)*: The model name, it should match a model declared under the `models` directory;
- `[attributes]` *(Object)*: An hash of attributes to initialize the model;
- `options` *(Object)*: The options hash:
  - `[error]` *(Function)*: Called if an error occurs, it must implement the `function(error)` interface:
    - `error` *(Error)*: The `Error` instance;
  - `[params]` *(Object)*: The params hash, used in URL substitution;
  - `[success]` *(Function)*: Called after the model instance has been successfully created, it must implement the `function(model)` interface:
    - `model` *(LazoModel)*: The recently created model instance.
  - `[ctx]` *(Object)*: The context object

#### Returns

*(Object)*: The Application instance

#### Example

```javascript
LAZO.app.createModel('person', {
  name: 'Tim', age: 5
}, {
  error: function (error) {
    console.log('Oops...');
  },
  success: function (person) {
    console.log(person.get('name') + " object was created");;
  }
  ctx: this.ctl.ctx   // Current request context
});
```

### <a name="createCollection"></a>`createCollection(collectionName, attributes, options)`

Creates a new collection instance.

#### Arguments

- `collectionName` *(String)*: The collection name, it should match a collection declared under the `models` directory;
- `[attributes]` *(Array)*: An array of attributes to initialize the child models;
-  `options` *(Object)*: The options hash:
    - `[error]` *(Function)*: Called if an error occurs, it must implement the `function(error)` interface:
        - `error` *(Error)*: The `Error` instance;
    - `modelName` *(String)*: The model that should be used to create the child instances, it must match a existing model in the application repo;
    - `[params]` *(Object)*: The params hash, used in URL substitution;
    - `[success]` *(Function)*: Called after the collection instance has been successfully created, it must implement the `function(collection)` interface:
        - `collection` *(LazoCollection)*: The recently created collection instance.

#### Returns

*(Object)*: The Application instance

#### Example

```javascript
LAZO.app.createCollection('people', [
    {name: 'Tim', age: 5},
    {name: 'Ida', age: 26},
    {name: 'Rob', age: 55}
  ],{
  error: function (error) {
    console.log('Oops...');
  },
  modelName: 'person',
  success: function (collection) {
    console.log('Yay!');
  },
  ctx: this.ctl.ctx   // current request context
});
```

### <a name="addTag"></a>`addTag(name, attributes, content)`

Adds the html tag in the document.

#### Arguments
- `name` *(String)* : Tag name
- `attributes` *(Objects)* : Hash of various attributes for the tag
- `content` *(String)* : Content for the tag

#### Returns

- *(Object)*: The application instance
#### Example

```javascript
LAZO.app.addTag('script',
    {
        'type': 'text/javascript',
        'lazo-application': '1'
    }, 'Hello');
    
// will add <script type="text/javascript" src="/hello.js">Hello</script> in <head> tag
```

### <a name="setHtmlTag"></a>`setHtmlTag(val)`

Sets the html tag of the document to the value specified.

#### Arguments
- `val` *(String)*: HTML tag value

#### Returns
- *(Object)*: The appliction instance

#### Example
```javascript
LAZO.app.setHtmlTag('<html lang="fr">');

// sets the document html element to <html lang="fr">
```
### <a name="setBodyClass"></a>`setBodyClass(val)`

Sets the class for the body tag in the document

#### Arguments
- `val` *(String)*: css class for the body tag
 
#### Returns
- *(Object)*: The application instance

#### Example
```javascript
LAZO.app.setBodyClass('foo');
// sets the DOM's body tag to <body class='foo'>
```
### <a name="setDefaultTitle"></a>`setDefaultTitle(title)`

Sets the title of the DOM

#### Arguments
- `title` *(String)*: The title to be set
 
#### Returns
- *(Object)*: The application instance

#### Example

```javascript
LAZO.app.setDefaultTitle('FOO');
// will set the title to FOO <title>FOO</title>
```
### <a name="registerTemplateEngine"></a>`registerTemplateEngine(engineDef, options)`

Registers a new template engine. For more information please refer to [templates](https://github.com/lazojs/lazo/wiki/Templates) 

#### Arguments
- `engineDef` *(Object)*:Hash for Template Engine Definition
    - `name` *(String)*: Template Engine Name
    - `extension` *(String)*: Extension for the template files
    - `handler` *(Function)*: Engine handler function that implements `function(engine)` interface and returns a object with following methods and functions
        - `compile` *(Function)*: Implementation for the interface `function(template)`
            - `template` *(Object)*:
        - `execute` *(Function)*: Implementation for the interface `function(template, context, templateName)`
            - `template` *(Object)*:
            - `context` *(Object)*:
            - `templateName` *(String)*:
        - `precompile` *(Function)*: Implementation for the interface `function(template)`
            - `template` *(Object)*:
        - `engine` *(Object)*: Template engine instance
    - `path` *(String)*: Path to the template engine
    - `exp` *(String)*:
- `options` *(Object)*: The options hash:
    - `[error]` *(Function)*: Called if an error occurs, it must implement the `function(error)` interface:
        - `error` *(Error)*: The `Error` instance;
    - `[success]` *(Function)*: Called after template engine is successfully registered, it must implement `function(engine)` interface.
        - `engine` *(Object)*: The instance of newly registered template engine
        
#### Returns

- *(Object)*: The application instance

#### Example

```javascript
define(['app/utils/nunjucks'], function (nunjucks) {

    'use strict';

    var nonjucksHandler = function(nonjucksEngine) {
        return {
            compile: function(template) {
                return nonjucksEngine.compile(template);
            },
            precompile: function (template) {
                return nonjucksEngine.precompile(template);
            },
            execute: function(template, context) {
                return template(context);
            },
            engine: nonjucksEngine
        };
    };
    
    var engineDef = {
        name: 'nunjucks',
        extension: 'njs',
        handler: nonjucksHandler,
        path: 'app/utils/nunjucks'
    };
    LAZO.app.registerTemplateEngine(engineDef, {
        success: function(engine) {
            // registered successfully
            // can now set it as a default template engine
        },
        error: function(error) {
            // error while registering the template engine
        }
    });
});
```

### <a name="getTemplateEngine"></a>`getTemplateEngine(engineName)`

Retrieves the template engine for the given engine name.

#### Arguments
- `engineName` *(String)*: Template Engine Name

#### Returns
- *(Object)*: Template Engine object

#### Example

```javascript
LAZO.app.getTemplateEngine('handlebars')
```

### <a name="getTemplateExt"></a>`getTemplateExt(engineName)`

Retrives the extension for the template files for a given template engine name.

#### Arguments
- `engineName` *(String)*: The name of the template engine

#### Returns
- *(String)*:The extension of the template files

#### Example

```javascript
LAZO.app.getTemplateExt('handlebars');  // returns 'hbs'
```
### <a name="getDefaultTemplateEngine"></a>`getDefaultTemplateEngine()`

Retrives the default template engine for the lazo application

#### Returns
- *(Object)*: The template engine object

#### Example
```javascript
LAZO.app.getDefaultTemplateEngine();
```

### <a name="getDefaultTemplateEngineName"></a>`getDefaultTemplateEngineName()`

Retrieves the default template engine name for the lazo application.

#### Returns
- *(String)*: The template engine name

#### Example

```javascript
LAZO.app.getDefaultTemplateEngineName()
```

### <a name="setDefaultTemplateEngine"></a>`setDefaultTemplateEngine(engineName)`

Sets the default template engine for lazo application

#### Arguments
- `engineName` *(String)*: The name of the template engine. 

#### Exception
- `Error` *(Exception)*: throws an exception if there exists no engine registered with the name provided

#### Example
```javascript
LAZO.app.setDefaultTemplateEngine('handlebars');
```






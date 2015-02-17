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
- `func` *(Function)*: Filter function

#### Returns
- The Application instance
- 
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

#### Arguments

#### Returns

#### Example

### <a name="navigate"></a>`navigate(ctx, routeName)`

#### Arguments

#### Returns

#### Example

### <a name="loadModel"></a>`loadModel(modelName, options)`

#### Arguments

#### Returns

#### Example

### <a name="loadCollection"></a>`loadCollection(collectionName, options)`

#### Arguments

#### Returns

#### Example

### <a name="createModel"></a>`createModel(modelName, attributes, options)`

#### Arguments

#### Returns

#### Example

### <a name="createCollection"></a>`createCollection(collectionName, attributes, options)`

#### Arguments

#### Returns

#### Example

### <a name="addTag"></a>`addTag(name, attributes, content)`

#### Arguments

#### Returns

#### Example

### <a name="setHtmlTag"></a>`setHtmlTag(val)`

#### Arguments

#### Returns

#### Example

### <a name="setBodyClass"></a>`setBodyClass(val)`

#### Arguments

#### Returns

#### Example

### <a name="setDefaultTitle"></a>`setDefaultTitle(title)`

#### Arguments

#### Returns

#### Example

### <a name="registerTemplateEngine"></a>`registerTemplateEngine(engineDef, options)`

#### Arguments

#### Returns

#### Example

### <a name="getTemplateEngine"></a>`getTemplateEngine(engineName)`

#### Arguments

#### Returns

#### Example

### <a name="getTemplateExt"></a>`getTemplateExt(engineName)`

#### Arguments

#### Returns

#### Example

### <a name="getDefaultTemplateEngine"></a>`getDefaultTemplateEngine()`

#### Arguments

#### Returns

#### Example

### <a name="getDefaultTemplateEngineName"></a>`getDefaultTemplateEngineName()`

#### Arguments

#### Returns

#### Example

### <a name="setDefaultTemplateEngine"></a>`setDefaultTemplateEngine(engineName)`

#### Arguments

#### Returns

#### Example

### <a name="getImport"></a>`getImport(relativePath)`

#### Arguments

#### Returns

#### Example







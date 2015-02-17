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
define(['l!lazoCtl'], function (Ctl) {
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
            console.log("Foo = " + LAZO.app.getData('foo', this.ctl.ctx));
        }
    });
});
```

### <a name="addRequestFilter"></a>`addRequestFilter(regex, func)`

#### Arguments

#### Returns

#### Example

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







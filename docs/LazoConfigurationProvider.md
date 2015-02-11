Lazo comes packaged with a Configuration Provider, `LAZO.config`.  Configuration data can be provided statically (`LAZO.config.HashPlugin`) or via a JSON configuration file (`LAZO.config.JSONPlugin`).  Here is an example of how to use the JSONPlugin configuration provider:

```javascript
define(['lazoApp'], function (LazoApp) {

    'use strict';

    return LazoApp.extend({

        initialize: function (callback) {
            var jsonPlugin = new LAZO.config.JSONPlugin({

                file: 'app/env.json',

                // called up on construction
                success: function () {
                    callback();
                },

                error: function (err) {
                    LAZO.logger.error('[app.initialize] Could not load env config', err);
                    callback();
                }

            });

            LAZO.config.addPlugin(jsonPlugin);
        }

    });

});
```

In order to support integration with more advanced configuration management systems, Lazo also provides a plug-in model that allows for custom configuration providers to be plugged into Lazo.  Here is an example of a custom plugin that initializes the configuration data from your own content management system:

```javascript
define(['lazoApp'], function (LazoApp) {

    'use strict';

    return LazoApp.extend({

        initialize: function (callback) {

            var cmPlugin = Config.Plugin.extend({
                constructor: function (options) {
                    if (LAZO.isServer) {
                        //initialize configuration data from Content Management System.
                        this._initServer(options);
                    } else {
                        //Use the Content Management System's client to initialize configuration data.
                        this._initClient(options);
                    }
                }, ...
            });

            LAZO.config.addPlugin((new cmPlugin());
        }

    });

});
```

In certain cases you may want contextual information to be passed into your configuration provider, so that you can make your application change configuration, i.e. behavior, at execution time.  This is most useful when implementing an authorization model in which the component configurations might be different for each user.  Here is an example of a custom plugin that retrieves the configuration data differently based on the context options parameter:

```javascript
define(['lazoApp'], function (LazoApp) {

    'use strict';

    return LazoApp.extend({

        initialize: function (callback) {

            var contextPlugin = Config.Plugin.extend({
                get: function (key, options) {
                    if (options && options.context) {
                        // retrieve configuration data based on the user's context.
                    } else  {
                        // otherwise, retrieve configuration data normally.
                    }
                }
            });

            LAZO.config.addPlugin((new contextPlugin());
        }

    });

});
```

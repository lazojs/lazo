Lazo keeps your code organized by breaking your code up into three main directories. In addition to these directories there are a few subdirectories and some naming conventions:

* `server` directories contain code that is only loaded and executed on the server, e.g., a model syncher. Code that resides in “server” and “node_modules” directories are never served to the client.
* `client` directories contain code that is only loaded and executed on the client, .e.g., CSS files or JavaScript widgets that rely on the DOM.
* Code that resides outside of these directories is considered common code and will be loaded both on the server and the client.

These naming conventions are used in conjunction with the Lazo module loader. A further breakdown of these main directories can be seen in the [components](LazoComponent.md), and [models](LazoModel.md) documentation.

```shell
/app
Application level code such as application.js, CSS, and utility modules

/components
Components - business logic encapsulation that ultimately produces HTML to be rendered.

/models
Models and collections
```

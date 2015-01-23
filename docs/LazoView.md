Lazo views are extended [Backbone views](http://backbonejs.org/#View) that run on both the client and server.
There are two types of Lazo views, the base view and a collection view, which is an extended base view.

### Base View
This view is intended to work with the Lazo request and rendering life cycles. The primary differences between
this view and a Backbone view are:

* Key options are merged into the view instance, e.g., `ctl`
* All view properties, with the exception of functions, are passed to the template rendering context
* All code that relies on the DOM should be initialized in `afterRender`
* Lazo data attributes are automatically added to a view's
root element
* `render` is defined and not intended to be overridden

#### Methods and Properties
The base view has properties and methods that provide hooks into the rendering life cycle making
it easy to extend. Below are the most commonly used public properties and methods.

##### ctl
This property is a reference to the controller that instantiated the view.

##### render
`render` is only executed on the client. It will render from the view down in the rendering tree context.
For example, if `render` is called on view for a controller that contains child components then the view
and the child component views will be rendered.

##### transformData
This method is passed the template context prior to rendering the template. Any transformations, such as
date or currency formatting can be done here. The return value is the transformed template context.

##### afterRender
`afterRender` is called after a view has been rendered on the client or when a view is attached to server
rendered content. Any client only code should be initialized using this method.

##### onRemove
`onRemove` is called when a view is removed from the DOM.

##### templateEngine
This is the name of the template engine that compiles the template. The default is the default template engine
for the application, which is [Handlebars](http://handlebarsjs.com/) unless otherwise specified. Any registered
template engine can be used. For instance, if “micro” is specified then Underscore's
[template engine](http://underscorejs.org/#template) will be used.

##### templateName
By default Lazo will look for a template with the same name of the view, e.g., if the view is `index.js` and
the template engine is Handlebars then it will attempt to resolve to `index.hbs`. The value can be a string or
a function that returns a template name minus the file extension.

#### Example

```javascript
// example view
define(['lazoView', 'app/moment'], function (LazoView, moment) {

    'use strict';

    return LazoView.extend({

        // format dates for display
        transformData: function (data) {
            var postingDt = data.models.posting.date;
            postingDt = moment(postingDt).format('M/D/YY');

            return data
        }

    });

});
```

### Collection View
The Lazo collection view is an extended Lazo base view. The Lazo collection view is designed to make it easier
to render a collection of models. A Lazo collection view can have 1 to _n_ collections associated to it.

#### Defining Collection Targets
Collections are mapped to templates by adding the `lazo-collection-target` attribute to an element within a template
and specifying a collection name as a value. In the case that a view renders a single collection the value is
simply “collection”. In the case that the view is rendering more than one collection then the value is the collection
name in the controller context property `collections`, e.g., `collections.collection_name`. If there is not any
surrounding markup or a template then the collection is rendered as a child of the view’s root element.

```html
<!-- single collection template -->
<ul lazo-collection-target="collection"></ul>

<!-- multi collection template -->
<h2>Pros</h2>
<ul lazo-collection-target="pros"></ul>
<h2>Cons</h2>
<ul lazo-collection-target="cons"></ul>
```

#### Methods and Properties
The Lazo collection view has properties and methods that provide hooks into the rendering life cycle making
it easy to extend.

##### collection
If only one collection is being rendered then it can be defined using this view property. The value can either
be a string, which is the name of the collection in the controller’s context, e.g., `collections.collection_name`,
or a reference to the collection instance itself.

##### itemView
This property is used to define a view class that is used to render each item in a collection. It can be a string
or an array of strings. If it is an array the default implementation returns the first item the array, but `getItemView`
can be overridden to define alternate resolver.

##### emptyView
This property is used to define a view to be rendered in the case that the collection is empty. It can be a string or
an array of strings. If it is an array the default implementation returns the first item the array, but `getEmptyView`
can be overridden to define alternate resolver.

##### views
This property is used to define item and empty views for collection views that render multiple collections. Below is
an example of the expected structure. If an alternate resolution pattern is desired then `getItemView` and `getEmptyView`
can be overridden.

```javascript
{
    views: {
        pros: {
            itemView: 'pro',
            emptyView: 'empty'
        },
        cons: {
            itemView: 'con',
            emptyView: 'empty'
        }
    }
}
```

##### addItemView
This property is used to add an `itemView` to the DOM. It is only executed on the client when a model is added to a
collection. It can be overridden for custom rendering such as animations. The arguments are `view`, `$target`,
and `collection`.

##### removeItemView
This property is used to remove an `itemView` from the DOM. It is only executed on the client when a model is removed
from a collection. It can be overridden for custom rendering such as animations. The arguments are `view`, `$target`,
and `collection`.

#### Example

```javascript
// example view
define(['lazoCollectionView'], function (LazoCollectionView) {

    'use strict';

    return LazoCollectionView.extend({

        collection: 'reviews',

        itemView: 'review'

    });

});
```

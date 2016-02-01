LazoCollectionViews extend [flexo.CollectionView](https://github.com/lazojs/flexo/blob/master/docs/index.md#lexocollectionview).
They are designed to run within the Lazo rendering life cycle. The following properties and methods should not be overridden:

* `hasTemplate`
* `eventNameSpace`
* `attributeNameSpace`
* `getAttributes`
* `augment`
* `getInnerHtml`
* `attachItemEmptyViews`


All of the properties and methods can be overridden and will function within the Lazo rendering life cycle allowing
you to plugin any rendering solution that is environment agnostic and returns a string. For more information on the
different properties and methods please consult the flexo
[documentation](https://github.com/lazojs/flexo/blob/master/docs/index.md#lexocollectionview)

```js
define(['LazoCollectionView'], function (LazoView) {

    return LazoView.extend({

        itemView: 'itemViewFileName',

        collection: 'collectionNameInCtx'

    });

});
```

define([
    'intern!bdd',
    'intern/chai!expect',
    'test/unit/utils',
    'sinon',
    'intern/chai!',
    'sinon-chai',
    'lazoView',
    'lazoCollectionView',
    'backbone'
], function (bdd, expect, utils, sinon, chai, sinonChai, LazoView, LazoCollectionView, Backbone) {
    chai.use(sinonChai);

    function loadView(viewName, options) {
        LAZO.require(['test/application/components/foo/views/' + viewName], function (View) {
            options.success(View);
        },
        function (err) {
            options.error(err);
        });
    }

    with (bdd) {

        describe('Collection View', function () {

            it('should construct a view instance', function () {
                var MyCollectionView = LazoCollectionView.extend({
                    name: 'my-collection-view',
                    collection: 'foo'
                });
                var MyCollection = Backbone.Collection.extend({});
                var view = new MyCollectionView({
                    ctl: {
                        ctx: {
                            collections: {
                                foo: new MyCollection([])
                            }
                        }
                    },
                    getTemplate: function (options) {
                        options.success('');
                    }
                });

                expect(view.collection).to.be.instanceof(MyCollection);
            });

            // requires a significant amount of stubbing; should probably be a functional test
            // it('should attach item and empty views for a view', function () {

            // });

            it('should resolve to a collection reference by name', function () {
                var completed = 0;
                var expected = 2;
                var dfd = this.async();
                var itemCollection = new Backbone.Collection([{ name: 'foo' }, { name: 'bar' }, { name: 'baz' }]);
                var emptyCollection = new Backbone.Collection([]);
                var MyMultiCollectionView = LazoCollectionView.extend({
                    name: 'my-collection-view',
                    collections: ['foo', 'bar']
                });
                var MySingleCollectionView = LazoCollectionView.extend({
                    name: 'my-collection-view',
                    collection: 'foo'
                });
                var multiCollectionView = new MyMultiCollectionView({
                    ctl: {
                        ctx: {
                            collections: {
                                foo: itemCollection,
                                bar: emptyCollection
                            }
                        }
                    }
                });
                var singleCollectionView = new MySingleCollectionView({
                    ctl: {
                        ctx: {
                            collections: {
                                foo: itemCollection,
                                bar: emptyCollection
                            }
                        }
                    }
                });

                function verify(collection) {
                    completed++;
                    expect(collection).to.be.instanceof(Backbone.Collection);
                    expect(collection.length).to.be.equal(3);
                    if (completed === expected) {
                        dfd.resolve();
                    }
                }

                multiCollectionView.resolveCollection('foo', {
                    success: function (collection) {
                        verify(collection);
                    },
                    error: function (err) {
                        throw err;
                    }
                });
                singleCollectionView.resolveCollection('foo', {
                    success: function (collection) {
                        verify(collection);
                    },
                    error: function (err) {
                        throw err;
                    }
                });
            });

            it('should get an item/empty view name by collection instance', function () {
                var itemCollection = new Backbone.Collection([{ name: 'foo' }, { name: 'bar' }, { name: 'baz' }]);
                var emptyCollection = new Backbone.Collection([]);
                var MySingleCollectionView = LazoCollectionView.extend({
                    name: 'my-collection-view',
                    collection: 'foo',
                    itemView: 'foo/bar/baz'
                });
                var view = new MySingleCollectionView({
                    ctl: {
                        ctx: {
                            collections: {
                                foo: itemCollection,
                                bar: emptyCollection
                            }
                        }
                    }
                });

                expect(view.getViewName('itemView', itemCollection)).to.be.equal('foo/bar/baz');
            });

            it('should get an item/empty view constructor', function () {
                var dfd = this.async();
                var completed = 0;
                var expected = 2;
                var itemCollection = new Backbone.Collection([{ name: 'foo' }, { name: 'bar' }, { name: 'baz' }]);
                var MyCollectionView = LazoCollectionView.extend({
                    name: 'my-collection-view',
                    collection: 'foo',
                    itemView: 'child',
                    emptyView: 'child'
                });
                var view = new MyCollectionView({
                    ctl: {
                        ctx: {
                            collections: {
                                foo: itemCollection
                            }
                        }
                    }
                });

                function verify(View) {
                    completed++;
                    expect(View.prototype.child).to.be.true;
                    if (completed === expected) {
                        dfd.resolve();
                    }
                }

                view._loadView = loadView;
                view.getItemView(itemCollection.at(0), itemCollection, {
                    success: function (View) {
                        verify(View);
                    },
                    error: function (err) {
                        throw err;
                    }
                });
                view.getEmptyView(itemCollection, {
                    success: function (View) {
                        verify(View);
                    },
                    error: function (err) {
                        throw err;
                    }
                });
            });

            it('should get item view construction options', function () {
                var itemCollection = new Backbone.Collection([{ name: 'foo' }, { name: 'bar' }, { name: 'baz' }]);
                var MyCollectionView = LazoCollectionView.extend({
                    name: 'my-collection-view',
                    collection: 'foo',
                    itemView: 'child',
                    emptyView: 'child'
                });
                var view = new MyCollectionView({
                    ctl: {
                        ctx: {
                            collections: {
                                foo: itemCollection
                            }
                        },
                        _getPath: function (name) {
                            return name;
                        },
                        _getBasePath: function (name) {
                            return name;
                        }
                    }
                });
                var options = view.getItemViewOptions('itemView', itemCollection.at(0), itemCollection, { foo: 1, bar: 2 });

                expect(options.name).to.be.equal('child');
                expect(options.foo).to.be.equal(1);
                expect(options.bar).to.be.equal(2);
            });

        });

    }
});
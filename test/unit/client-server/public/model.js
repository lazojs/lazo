define([
    'intern!bdd',
    'intern/chai!',
    'intern/chai!expect',
    'sinon',
    'sinon-chai',
    'test/unit/utils',
    'lazoModel',
], function (bdd, chai, expect, sinon, sinonChai, utils, LazoModel) {
    chai.use(sinonChai);

    with (bdd) {
        describe('publicModel', function () {

            describe('#set', function () {
                it('should set the child', function () {
                    var dfd = this.async();

                    var ParentModel = LazoModel.extend({
                        modelsSchema: [
                            {
                                name: 'child',
                                locator: 'foo.bar.baz',
                                prop: 'theProp'
                            }
                        ]
                    });
                    var ChildModel = LazoModel.extend({
                    });

                    var p = new ParentModel(null, {});
                    p.theProp = new ChildModel(null, {});
                    
                    p.set('foo', {
                            bar: {
                                baz: {
                                    a: 'b'
                                }
                            }
                    });
                    
                    expect(p.theProp.get('a')).to.equal('b');
                    dfd.resolve();
                });
                
                it('should NOT set the child', function () {
                    var dfd = this.async();

                    var ParentModel = LazoModel.extend({
                        modelsSchema: [
                            {
                                name: 'child',
                                locator: 'foo.bar.baz',
                                prop: 'theProp'
                            }
                        ]
                    });
                    var ChildModel = LazoModel.extend({
                    });

                    var p = new ParentModel(null, {});
                    p.theProp = new ChildModel(null, {});
                    
                    p.set('foo', {
                            bar: {
                                baz: {
                                    a: 'b'
                                }
                            }
                        },
                        {
                            syncDataToChildren: false
                        }
                    );
                    
                    expect(p.theProp.get('a')).to.not.equal('b');
                    dfd.resolve();
                });
                
            });
            
            describe('#save', function () {
                it('should save child data to parent', function () {
                    var dfd = this.async();

                    var ParentModel = LazoModel.extend({
                        modelsSchema: [
                            {
                                name: 'child',
                                locator: 'foo.bar.baz',
                                prop: 'theProp'
                            }
                        ],

                        sync: function(method, model, options) {
                            options.success(this);
                        }
                    });
                    
                    var ChildModel = LazoModel.extend({
                    });

                    var p = new ParentModel({'foo': {
                        bar: {
                            baz: {
                                a: 'b'
                            }
                        }
                    }}, {});
                    p.theProp = new ChildModel(null, {});

                    p.theProp.set('a', 'c');
                    
                    p.save(null, {
                        success: function (m) {
                            expect(p.get('foo').bar.baz.a).to.equal('c');
                            dfd.resolve();
                        }
                    });
                });    
                
                it('should NOT save child data to parent', function () {
                    var dfd = this.async();

                    var ParentModel = LazoModel.extend({
                        modelsSchema: [
                            {
                                name: 'child',
                                locator: 'foo.bar.baz',
                                prop: 'theProp'
                            }
                        ],

                        sync: function(method, model, options) {
                            options.success(this);
                        }
                    });
                    
                    var ChildModel = LazoModel.extend({
                    });

                    var p = new ParentModel({'foo': {
                        bar: {
                            baz: {
                                a: 'b'
                            }
                        }
                    }}, {});
                    p.theProp = new ChildModel(null, {});

                    p.theProp.set('a', 'c');
                    
                    p.save(null, {
                        syncDataFromChildren: false,
                        success: function (m) {
                            expect(p.get('foo').bar.baz.a).to.not.equal('c');
                            expect(p.get('foo').bar.baz.a).to.equal('b');
                            dfd.resolve();
                        }
                    });
                });    
                
            });
        });

    }
});
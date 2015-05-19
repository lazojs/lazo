define([
    'intern!bdd',
    'intern/chai!',
    'intern/chai!expect',
    'sinon',
    'sinon-chai',
    'test/unit/utils',
    'utils/ctlSerializor'
], function (bdd, chai, expect, sinon, sinonChai, utils, ctlSerializor) {
    chai.use(sinonChai);

    var id = 0;

    function generateCtl(name) {
        return {
            name: name,
            cid: name + (++id),
            ctx: {
                models: {},
                collections: {},
                _rootCtx: {
                    blah: 1
                },
                params: {
                    '<script>alert("hello")</script>': '<script>alert("hello")</script>',
                    good: 1,
                    bad: '<script>alert("hello")</script>'
                }
            },
            children: {},
            currentView: {
                cid:'view'  + (++id),
                name:'index',
                ref:'components/' + name + '/views/index',
                templatePath:'components/' + name + '/views/index.hbs',
                basePath:'components/' + name + '/views',
                isBase: false,
                hasTemplate: true
            },
            toJSON: function (rootCtx) {
                return ctlSerializor.serialize(this);
            }
        };
    }

    with (bdd) {
        describe('Controller Serializor', function () {

            it('should serialize a component controller for transport', function () {
                var serializedCtl;
                var ctl = generateCtl('foo');

                ctl.children.bar = [generateCtl('bar')];
                ctl.children.bar[0].children.baz = [generateCtl('baz')];
                serializedCtl = ctlSerializor.serialize(ctl);

                expect(serializedCtl).to.include.keys('cid', 'name', 'ctx', 'isBase', 'currentView', 'children');
                // check if children were serialized
                expect(serializedCtl.children.bar[0]).to.be.Object;
                expect(serializedCtl.children.bar[0].children.baz).to.be.Object;
                // check if views were serialized
                expect(serializedCtl.currentView).to.be.Object;
                expect(serializedCtl.children.bar[0].currentView).to.be.Object;
                expect(serializedCtl.currentView).to.include
                    .keys('cid', 'name', 'ref', 'templatePath', 'compiledTemplatePath', 'basePath', 'isBase', 'hasTemplate');
                // check if params were encoded
                expect(serializedCtl.ctx.params['%3Cscript%3Ealert(%22hello%22)%3C%2Fscript%3E']).to.exist;
                expect(serializedCtl.ctx.params.bad).to.be.equal('%3Cscript%3Ealert(%22hello%22)%3C%2Fscript%3E');
            });

        });
    }
});
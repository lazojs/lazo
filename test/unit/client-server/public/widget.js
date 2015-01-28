define([
    'intern!bdd',
    'intern/chai!',
    'intern/chai!expect',
    'sinon',
    'sinon-chai',
    'test/unit/utils',
    'lazoWidget'
], function (bdd, chai, expect, sinon, sinonChai, utils, LazoWidget) {
    chai.use(sinonChai);

    with (bdd) {
        describe('Lazo Widget Interface', function () {
            var MyWidget = LazoWidget.extend({});
            var spy = sinon.spy(MyWidget.prototype, 'initialize');
            var widget = new MyWidget({
                view: {
                    ctl: {
                        ctx: {
                            foo: 1,
                            bar: true,
                            baz: 'baz'
                        }
                    }
                },
                obj: '{ foo: true }',
                arr: '[1, 2, 3]',
                'data-foo': '$.foo',
                'data-bar': '$.bar',
                'data-baz': '$.baz',
                num1: '1.03',
                num2: '8',
                bool1: 'true',
                bool2: 'false'
            });

            it('should have empty implementation and default values', function () {
                expect(widget.initialize).to.be.Function;
                expect(widget.render).to.be.Function;
                expect(widget.bind).to.be.Function;
                expect(widget.unbind).to.be.Function;
                expect(widget.afterRender).to.be.Function;
                expect(widget.attrValCoercion).to.be.true;
            });

            it('should construct a LazoWidget instance', function () {
                expect(widget).to.be.instanceof(LazoWidget);
                expect(spy).to.have.been.calledOnce;
            });

            it('should coerce values', function () {
                expect(widget.attributes.obj).to.be.Object;
                expect(widget.attributes.arr).to.be.Array;
                expect(widget.attributes.num1).to.be.equal(1.03);
                expect(widget.attributes.num2).to.be.equal(8);
                expect(widget.attributes.bool1).to.be.true;
                expect(widget.attributes.bool2).to.be.false;
            });

            it('should resolve context values', function () {
                expect(widget.attributes.$.foo).to.be.equal(1);
                expect(widget.attributes.$.bar).to.be.true;
                expect(widget.attributes.$.baz).to.be.equal('baz');
            });

        });
    }
});
define([
    'intern!bdd',
    'intern/chai!',
    'intern/chai!expect',
    'sinon',
    'sinon-chai',
    'test/unit/utils',
    'lazoModel',
    'lazoCollection'
], function (bdd, chai, expect, sinon, sinonChai, utils, LazoModel, LazoCollection) {
    chai.use(sinonChai);

    with (bdd) {
        describe('publicCollection', function () {

            it('should assign the correct model name to collection items', function () {

                var ChildModel = LazoModel.extend({});
                var ParentCollection = LazoCollection.extend({
                    model: ChildModel
                });

                var parent = new ParentCollection(null, { modelName: 'childModel' });
                parent.add(new ChildModel({ id: 1 }, {}));

                expect(parent.models[0].name).to.exist;
            });

        });

    }
});
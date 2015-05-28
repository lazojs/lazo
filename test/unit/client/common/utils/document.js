define([
    'intern!bdd',
    'intern/chai!',
    'intern/chai!expect',
    'sinon',
    'sinon-chai',
    'test/unit/utils',
    'utils/document',
    'jquery'
], function (bdd, chai, expect, sinon, sinonChai, utils, doc, $) {
    chai.use(sinonChai);

    with (bdd) {
        describe('document utils', function () {

            it('set page title', function () {
                var $title = $('title');
                doc.setTitle('foobar');
                expect($title.text()).to.be.equal('foobar');
            });

            // link.onload is not being called when test is executed in phantomjs because it
            // is not supported by the version of webkit phantomjs is running
            it('should update css', function () {
                this.skip(); // test failing regardless of env because link.onload never executes
                // if (window.navigator.userAgent.indexOf('PhantomJS') !== -1 || window.lazoLocalTesting) {
                //     this.skip();
                // }

                var add = [{ href: '../../test/mocks/css/b.css' }, { href: '../../test/mocks/css/c.css' }, { href: '../../test/mocks/css/d.css' }];
                var remove = [{ href: '../../test/mocks/css/a.css' }];
                var $head = $('head');
                var dfd = this.async();

                $head.append('<link href="../../test/mocks/css/a.css" rel="stylesheet" type="text/css" lazo-link="css"></link>');

                doc.updateLinks(add, remove, 'css', function () {
                    var $links = $('link[lazo-link="css"]');
                    expect($links.length).to.be.equal(3);
                    $links.each(function (i) {
                        expect($(this).attr('href')).to.be.equal(add[i]);
                    });
                    dfd.resolve();
                });
            });

            it('add, get page tags', function () {

                var ctx = {
                    _rootCtx: {},
                    meta: {}
                };

                expect(doc.getPageTags(ctx, false).length).to.equal(0);
                doc.addPageTag(ctx, false, 'meta', { description: 'text' });
                expect(doc.getPageTags(ctx, false).length).to.equal(1);
            });

            it('updates page tags', function () {
                var dfd = this.async();
                var ctx = {
                    _rootCtx: {
                        pageTags: [
                            { name: 'meta', attributes: { description: 'text' }, content: null },
                            { name: 'meta', attributes: { keywords: 'keyword' }, content: null }
                        ]
                    },
                    meta: {
                        pageTags: []
                    }
                };

                // simulate initial update on client
                doc.updatePageTags(ctx, function (err) {
                    expect(err).to.not.exist;
                    expect(ctx._rootCtx.pageTags.length).to.equal(0);
                    expect(ctx.meta.pageTags.length).to.equal(0);

                    doc.addPageTag(ctx, false, 'meta', { description: 'text' });
                    doc.addPageTag(ctx, false, 'meta', { keywords: 'keyword' });
                    expect(ctx.meta.pageTags.length).to.equal(2);

                    // simulate secondary update on client
                    doc.updatePageTags(ctx, function (err) {
                        expect(err).to.not.exist;
                        expect(ctx._rootCtx.pageTags.length).to.equal(2);
                        expect(ctx.meta.pageTags.length).to.equal(0);
                        dfd.resolve();
                    });
                });
            });
        });
    }
});
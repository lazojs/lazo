define(['jquery', 'async', 'underscore'], function ($, async, _) {

    'use strict';

    var htmlTag = '',
        bodyClass = '',
        tags = [],
        tagAttributeDefaults = {
            script: {
                type: 'text/javascript',
                'lazo-application': '1'
            },
            link: {
                rel: 'stylesheet',
                type: 'text/css',
                'lazo-application': '1'
            }
        };

    return {

        setHtmlTag: function (val) {
            htmlTag = val;
            return this;
        },

        setBodyClass: function (val) {
            bodyClass = val;
            return this;
        },

        getHtmlTag: function () {
            return htmlTag;
        },

        getBodyClass: function () {
            return bodyClass;
        },

        addTag: function (name, attributes, content) {
            tags.push(this._createTag(name, attributes, content));

            if (LAZO.app.isClient) {
                this._addTagToDOM(name, attributes, content);
            }

            return this;
        },

        getTags: function () {
            return tags;
        },

        setTitle: function (title) {
            var t = _.find(tags, function (tag) { return tag.name === 'title'; }),
                $title;

            if (t) {
                t.content = title;
            } else {
                this.addTag('title', {}, title);
            }

            if (LAZO.app.isClient) {
                $title = $('title');
                if ($title.length) {
                    $title.html(title);
                } else {
                    this._addTagToDOM('title', {}, title);
                }
            }

            return this;
        },

        updateLinks: function (add, remove, type, callback) {
            var i;
            var tasks = [];
            var self = this;

            this.$head = this.$head || $('head');

            for (i = 0; i < add.length; i++) {
                (function (i) {
                    tasks.push(function (callback) {
                        var link  = document.createElement('link');
                        var head = self.$head[0];

                        for (var k in add[i]) {
                            link.setAttribute(k, add[i][k]);
                        }
                        link.setAttribute('lazo-link', type);
                        link.onload = function () {
                            callback(null);
                        };
                        link.onerror = function (e) {
                            LAZO.logger.warn('[application.navigate] Error while loading link %s', add[i], e);
                            callback(null);
                        };

                        head.appendChild(link);
                    });
                })(i);
            }

            async.parallel(tasks, function (err) {
                // remove previous links after the new links have been added
                // to prevent fousc when layout has not changed
                for (i = 0; i < remove.length; i++) {
                    self.$head.find('[href="' + remove[i].href + '"][lazo-link="' + type + '"]:first').remove();
                }
                callback();
            });
        },

        setsDefaultTitle: function (title) {
            this.defaultTitle = title;
            return this;
        },

        addPageTag: function (ctx, isServer, name, attributes, content) {

            var pageTag = this._createPageTag(name, attributes, content);

            if (isServer) {
                // Serialize the page tags to the client
                ctx._rootCtx.pageTags = ctx._rootCtx.pageTags || [];
                ctx._rootCtx.pageTags.push(pageTag);
            }

            ctx.pageTags = ctx.pageTags || [];
            ctx.pageTags.push(pageTag);

        },

        getPageTags: function (ctx) {
            return ctx.pageTags;
        },

        updatePageTags: function (ctx, callback) {

            var self = this;
            var addTasks = [];

            ctx._rootCtx.pageTags = ctx._rootCtx.pageTags || [];
            while (ctx._rootCtx.pageTags.length > 0) {
                self._removeTagFromDOM(ctx._rootCtx.pageTags.pop());
            }

            while (ctx.pageTags.length > 0) {
                var tag = ctx.pageTags.pop();

                // Add to root ctx
                ctx._rootCtx.pageTags.push(tag);

                (function (pageTag) {
                    addTasks.push(function (callback) {
                        // Render
                        self._addTagToDOM(pageTag.name, pageTag.attributes, pageTag.content);
                        callback();
                    });
                })(tag);

            }

            async.parallel(addTasks, function (err) {
                if (err) {
                    return callback(err);
                }

                callback();
            });

        },

        _createPageTag: function (name, attributes, content) {
            return { name: name, attributes: attributes|| [], content: content  || null };
        },

        _createTag: function (name, attributes, content) {
            var defaults;

            content = content || null;
            defaults = _.clone(tagAttributeDefaults[name] || {});
            attributes = _.extend(defaults, attributes);

            return { name: name, attributes: _.extend(defaults, attributes), content: content };
        },

        _renderTagAttributes: function (name, attributes) {

            return _.reduce(attributes || [], function(memo, val, key){
                return memo + (' ' + key + '="' + val + '"');
            }, '');

        },

        _addTagToDOM: function (name, attributes, content) {
            this.$head = this.$head || $('head');
            var attrStr = this._renderTagAttributes(name, attributes);
            this.$head.append('<' + name + attrStr + '>' + (content || '') + '</' + name + '>');
        },

        _removeTagFromDOM: function (tag) {

            if (LAZO.app.isClient) {

                var self = this;
                var attrStr = self._renderTagAttributes(tag.name, tag.attributes);
                var selector = tag.name + attrStr + ':first';

                self.$head = self.$head || $('head');
                self.$head.find(selector).remove();
            }

        }

    };

});
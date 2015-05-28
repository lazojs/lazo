define(['jquery', 'async', 'underscore', 'utils/sanitizer'], function ($, async, _, sanitizer) {

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
            var tag = this._createTag(name, attributes, content);
            tags.push(tag);

            if (LAZO.app.isClient) {
                this._addTagToDOM(tag);
            }

            return this;
        },

        getTags: function () {
            return tags;
        },

        setTitle: function (title) {
            var t = _.find(tags, function (tag) { return tag.name === 'title'; }),
                $title;

            var titleTag = this._createTag('title', {}, title);

            if (t) {
                t.content = titleTag.content;
            } else {
                tags.push(titleTag); // prevent duplicate title tags in header
            }

            if (LAZO.app.isClient) {
                $title = $('title');
                if ($title.length) {
                    $title.html(titleTag.content); // TODO: Ensure script injection prevention, test with IE (IE Bug may prevent title being set correctly)
                } else {
                    this._addTagToDOM(titleTag);
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
            else {
                ctx.meta = ctx.meta || {};
                ctx.meta.pageTags = ctx.meta.pageTags || [];
                ctx.meta.pageTags.push(pageTag);
            }
        },

        getPageTags: function (ctx, isServer) {

            if (isServer) {
                return ctx._rootCtx.pageTags || [];
            }

            ctx.meta = ctx.meta || {};
            return ctx.meta.pageTags || [];
        },

        updatePageTags: function (ctx, callback) {

            if (!LAZO.app.isClient) {
                return callback();
            }

            var self = this;
            var addTasks = [];

            ctx._rootCtx.pageTags = ctx._rootCtx.pageTags || [];
            while (ctx._rootCtx.pageTags.length > 0) {
                self._removeTagFromDOM(ctx._rootCtx.pageTags.pop());
            }

            ctx.meta = ctx.meta || {};
            ctx.meta.pageTags = ctx.meta.pageTags || [];
            while (ctx.meta.pageTags.length > 0) {
                var tag = ctx.meta.pageTags.pop();

                // Add to root ctx
                ctx._rootCtx.pageTags.push(tag);

                (function (pageTag) {
                    addTasks.push(function (callback) {
                        // Render
                        self._addTagToDOM(pageTag);
                        callback();
                    });
                })(tag);

            }

            async.parallel(addTasks, function (err) {
                if (err) {
                    LAZO.logger.error('Failed adding page tags. %s', err);
                    return callback(err);
                }

                callback();
            });

        },

        _createPageTag: function (name, attributes, content) {
            return this._encodeTag(name, attributes, content);
        },

        _createTag: function (name, attributes, content) {
            var defaults;

            content = content || null;
            defaults = _.clone(tagAttributeDefaults[name] || {});

            return this._encodeTag(name, _.extend(defaults, attributes), content);
        },

        _encodeTag: function (name, attributes, content) {

            attributes = attributes || [];
            var keys = _.keys(attributes);
            var encodedAttributes = {};
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                encodedAttributes[key] = sanitizer.encode(attributes[key]);
            }

            var encodedContent = null;
            if (content) {
                encodedContent = sanitizer.encode(content);
            }

            return { name: name, attributes: encodedAttributes, content: encodedContent };

        },

        _addTagToDOM: function (tag) {

            if (!LAZO.app.isClient) {
                return;
            }

            var self = this;
            self.$head = self.$head || $('head');

            var selector = self._getTagSelector(tag);
            var attrStr = _.reduce(tag.attributes || [], function(memo, val, key){
                return memo + (' ' + key + '="' + val + '"');
            }, '');

            // determine if the tag already exists
            if (self.$head.find(selector).length) {
                LAZO.logger.debug('Duplicate tag will not be added: %s, %s, %s', tag.name, attrStr, tag.content);
                return;
            }

            self.$head.append('<' + tag.name + attrStr + '>' + (tag.content || '') + '</' + tag.name + '>');
        },

        _removeTagFromDOM: function (tag) {

            if (!LAZO.app.isClient) {
                return;
            }

            var self = this;
            self.$head = self.$head || $('head');

            var selector = self._getTagSelector(tag);
            self.$head.find(selector).remove();

        },

        _getTagSelector: function (tag) {
            var attrStr = _.reduce(tag.attributes, function(memo, val, key){
                return memo + ('[' + key + '="' + val + '"]');
            }, '');
            return tag.name + attrStr + ':first';
        }

    };

});
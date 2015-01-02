define(['underscore', 'htmlparser', 'htmlparserToString'], function (_, htmlParser, toString) {

    'use strict';

    return {

        getWidgetsHtml: function (viewHtml, options) {
            var self = this;
            if (!_.size(this.widgets)) {
                return options.success(viewHtml);
            }

            this._parse(viewHtml, {
                success: function (list) {
                    self._addWidgetsToList(list, {
                        success: function (list) {
                            options.success(toString(list));
                        },
                        error: options.error
                    });
                },
                error: options.error
            });
        },

        _parse: function (html, options) {
            var handler = new htmlParser.DefaultHandler(function (err, list) {
                if (err) {
                    return options.error(err);
                }

                options.success(list);
            });
            var parser = new htmlParser.Parser(handler);
            parser.parseComplete(html);
        },

        _addWidgetsToList: function (list, options) {
            var self = this;
            var expected = 0;
            var resolved = 0;

            for (var i = 0; i < list.length; i++) {
                (function getWidget(node) {
                    // if the node is a widget container and the container is empty then render widget node
                    if (node.attribs && node.attribs['lazo-widget'] && !node.attribs['lazo-widget'].children) {
                        expected++;
                        self._resolveWidget(node, {
                            success: function () {
                                resolved++;
                                if (resolved === expected) {
                                    options.success(list);
                                }
                            },
                            error: options.error
                        });
                    }
                    if (node.children) {
                        for (var i = 0; i < node.children.length; i++) {
                            getWidget(node.children[i]);
                        }
                    }
                })(list[i]);
            }

            if (!expected) {
                options.success(list);
            }
        },

        _resolveWidget: function (node, options) {
            var name = node.attribs['lazo-widget'];
            var self = this;
            this._widgets = this._widgets || {};

            function getHtml(Widget, node) {
                var widget = new Widget(_.extend({
                    view: self
                }, node.attribs));
                widget.render({
                    success: function (html) {
                        self._parse(html, {
                            success: function (widgetNode) {
                                node.children = [widgetNode];
                                options.success(node);
                            },
                            error: options.error
                        });
                    },
                    error: options.error
                });
            }

            // widget has already been resolved
            if (this._widgets && this._widgets[name]) {
                getHtml(this._widgets[name], node);
            }
            // widget is a path
            if (_.isString(this.widgets[name])) {
                this._loadWidget(this.widgets[name], {
                    success: function (widget) {
                        self._widgets[name] = widget;
                        getHtml(widget, node);
                    },
                    error: options.error
                });
            // widget is a constructor
            } else {
                this._widgets[name] = this.widgets[name];
                getHtml(this._widgets[name], node);
            }
        },

        _loadWidget: function (path, options) {
            LAZO.require(path, function (View) {
                options.success(View);
            },
            function (err) {
                options.error(err);
            });
        }

    };

});
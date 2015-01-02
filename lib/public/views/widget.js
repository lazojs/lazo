define(['underscore', 'htmlparser', 'htmlparserToString', 'jquery'], function (_, htmlParser, toString, $) {

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

        attachWidgets: function (options) {
            var $descViews = this.$('[lazo-view]');
            var $widgets = this.$('[lazo-widget]');
            var self = this;

            // filter out widgets of descendent views
            $widgets.filter(function () {
                var widgetEl = this;
                return $descViews.each(function () {
                    return !$.contains(this, widgetEl);
                });
            });

            var expected = $widgets.length;
            var attached = 0;
            $widgets.each(function () {
                var $widget = $(this);
                var name = $widget.attr('lazo-widget');
                self._resolveWidget(name, {
                    success: function (Widget) {
                        var widget = new Widget(_.extend({
                            view: self },
                            self._resolveWidgetElAttrs($widget[0])));

                        widget.el = $widget[0];
                        widget.bind($widget[0]);
                        attached++;
                        self.widgets[name] = _.isArray(self.widgets[name]) ? self.widgets[name] : [];
                        self.widgets[name].push(widget);
                        if (attached === expected) {
                            options.success(true);
                        }
                    },
                    error: options.error
                });
            });
        },

        _resolveWidgetElAttrs: function (el) {
            var retVal = {};
            for (var i = 0; i < el.attributes.length; i++) {
                retVal[el.attributes[i].name] = el.attributes[i].value;
            }
            return retVal;
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
                        node.attribs.class = node.attribs.class ? node.attribs.class + ' rendering' : 'rendered';
                        self._resolveWidget(node.attribs['lazo-widget'], {
                            success: function (Widget) {
                                var widget = new Widget(_.extend({
                                    view: self
                                }, node.attribs));
                                widget.render({
                                    success: function (html) {
                                        self._parse(html, {
                                            success: function (widgetNode) {
                                                node.children = [widgetNode];
                                                resolved++;
                                                if (resolved === expected) {
                                                    options.success(list);
                                                }
                                            },
                                            error: options.error
                                        });
                                    },
                                    error: options.error
                                });
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

        _resolveWidget: function (name, options) {
            var self = this;
            this._widgets = this._widgets || {};

            // widget has already been resolved
            if (this._widgets && this._widgets[name]) {
                return options.success(this._widgets[name]);
            }
            // widget is a path
            if (_.isString(this.widgets[name])) {
                this._loadWidget(this.widgets[name], {
                    success: function (widget) {
                        self._widgets[name] = widget;
                        options.success(widget);
                    },
                    error: options.error
                });
            // widget is a constructor
            } else {
                this._widgets[name] = this.widgets[name];
                options.success(this._widgets[name]);
            }
        },

        _loadWidget: function (path, options) {
            LAZO.require(path, function (View) {
                options.success(View);
            },
            function (err) {
                options.error(err);
            });
        },

        _removeWidgets: function () {
            for (var k in this.widgets) {
                for (var i = 0; i < this.widgets[k].length; i++) {
                    this.widgets[k].unbind(this.widgets[k].el);
                }
            }
        }

    };

});
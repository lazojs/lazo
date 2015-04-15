define(['underscore', 'htmlparser', 'htmlparserToString', 'utils/module', 'jquery', 'uiStateMixin'],
    function (_, htmlParser, toString, module, $, uiStateMixin) {

    'use strict';

    return _.extend({

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
            var $descViews = this.$('[lazo-view-name]');
            var $widgets = this.$('[lazo-widget]');
            var self = this;

            // filter out widgets of descendent views
            $widgets = $widgets.filter(function () {
                var widgetEl = this;
                var isDescendent = false;
                $descViews.each(function () {
                    if ($.contains(this, widgetEl)) {
                       isDescendent = true;
                       return false;
                    }
                });

                return !isDescendent;
            });

            var expected = $widgets.length;
            var attached = 0;
            self.widgetInstances = self.widgetInstances || {};
            if (!expected) {
                options.success(true);
            }
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
                        $(widget.el).removeClass(self.getStateClass('unbound')).addClass(self.getStateClass('bound'));
                        widget._uiStates = widget.getStates();
                        widget.afterRender({
                            success: function () {
                                $(widget.el).removeClass(self.getStateClass('rendering')).addClass(self.getStateClass('rendered'));
                            },
                            error: function (err) {
                                LAZO.logger.warn('[lazoWidget] Error while binding widget', err);
                            }
                        });
                        attached++;
                        self.widgetInstances[name] = _.isArray(self.widgetInstances[name]) ? self.widgetInstances[name] : [];
                        self.widgetInstances[name].push(widget);
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
                    if (node.attribs && node.attribs['lazo-widget']) {
                        node.attribs.class = (node.attribs.class ? node.attribs.class + ' ' : '') + self.getStateClass('unbound');
                        node.attribs.class += ' ' + self.getStateClass('rendering');

                        if (!node.children) {
                            expected++;
                            self._resolveWidget(node.attribs['lazo-widget'], {
                                success: function (Widget) {
                                    var widget = new Widget(_.extend({
                                        view: self
                                    }, node.attribs));
                                    if (widget._uiStates) {
                                        node.attribs.class = _.reduce(widget._uiStates, function (memo, state) {
                                            return memo + ' ' + self.getStateClass(state);
                                        }, node.attribs.class);
                                    }
                                    self._getWidgetCss(Widget);
                                    widget.render({
                                        success: function (html) {
                                            self._parse(html, {
                                                success: function (widgetNode) {
                                                    node.children = widgetNode;
                                                    resolved++;
                                                    // ensure expected count is done
                                                    setTimeout(function () {
                                                        if (resolved === expected) {
                                                            options.success(list);
                                                        }
                                                    }, 0);
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
                    }
                    if (node.children) {
                        for (var i = 0; i < node.children.length; i++) {
                            // limit scope to current view
                            if (!node.children[i].attribs || !node.children[i].attribs['lazo-view-id']) {
                                getWidget(node.children[i]);
                            }
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

            // widget has already been resolved
            if (_.isFunction(this.widgets[name])) {
                return options.success(this.widgets[name]);
            }
            // widget is a path
            if (_.isString(this.widgets[name])) {
                this._loadWidget(this.widgets[name], {
                    success: function (widget) {
                        self.widgets[name] = widget;
                        options.success(widget);
                    },
                    error: options.error
                });
            // widget is a constructor
            } else {
                options.success(this.widgets[name]);
            }
        },

        _getWidgetCss: function (Widget) {
            var self = this;
            var ctx = this.ctl.ctx;
            var rootCtx = ctx._rootCtx;
            var widgetCss;

            // add widget css to route
            if (Widget.prototype.css) {
                widgetCss = _.map(_.isArray(Widget.prototype.css) ? Widget.prototype.css : [Widget.prototype.css], function (href) {
                    return self.ctl.augmentCssLink({ href: href, 'lazo-link-ctx': self.ctl.name });
                });

                rootCtx.dependencies.css = _.uniq(widgetCss.concat(rootCtx.dependencies.css), function (link) {
                    return link.href;
                });
            }
        },

        _loadWidget: function (path, options) {
            var ctx = this.ctl.ctx;

            LAZO.require([path], function (Widget) {
                if (LAZO.app.isServer) {
                    module.addPath(path, ctx);
                }
                options.success(Widget);
            },
            function (err) {
                options.error(err);
            });
        },

        _removeWidgets: function () {
            for (var k in this.widgetInstances) {
                for (var i = 0; i < this.widgetInstances[k].length; i++) {
                    this.widgetInstances[k][i].unbind(this.widgetInstances[k][i].el);
                }
            }
        }

    }, uiStateMixin);

});
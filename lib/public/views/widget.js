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

        attachWidgets: function (options, expected, attached) {
            var parent = options.parent || this;
            var $root = $(parent.el);
            var $descViews = $root.find('[lazo-view-name]');
            var $widgets = $root.find('[lazo-widget]');
            var self = this;

            attached = _.isNumber(attached) ? attached : 0;
            expected = _.isNumber(expected) ? expected : 0;

            // filter out widgets that are descendants of other views
            // and other widgets
            _.each([$descViews, $widgets], function ($collection) {
                $widgets = $widgets.filter(function () {
                    var widgetEl = this;
                    var isDescendent = false;
                    $collection.each(function () {
                        if ($.contains(this, widgetEl)) {
                           isDescendent = true;
                           return false;
                        }
                    });

                    return !isDescendent;
                });
            });

            expected += $widgets.length;
            // clean up old widgets
            this._removeWidgets.call(parent);
            parent.widgetInstances = {};

            $widgets.each(function () {
                var $widget = $(this);
                var name = $widget.attr('lazo-widget');
                self._resolveWidget(name, {
                    parent: parent,
                    success: function (Widget) {
                        var widget = new Widget(_.extend({
                            view: self },
                            self._resolveWidgetElAttrs($widget[0])));

                        widget.name = name;
                        widget.el = $widget[0];
                        widget.bind($widget[0]);
                        attached++;
                        $(widget.el).removeClass(self.getStateClass('unbound')).addClass(self.getStateClass('bound'));
                        widget._uiStates = widget.getStates();
                        widget.afterRender({
                            success: function () {
                                $(widget.el).removeClass(self.getStateClass('rendering')).addClass(self.getStateClass('rendered'));
                            },
                            error: function (err) {
                                LAZO.logger.warn('[lazoWidget] Error while executing widget afterRender', err);
                            }
                        });
                        parent.widgetInstances[name] = _.isArray(parent.widgetInstances[name]) ? parent.widgetInstances[name] : [];
                        parent.widgetInstances[name].push(widget);
                        self.attachWidgets({
                            success: options.success,
                            error: options.error,
                            parent: widget
                        }, expected, attached);
                    },
                    error: options.error
                });
            });

            // ensure expected count is done
            setTimeout(function () {
                if (!$widgets.length && attached === expected) {
console.log(self.name + ': ' + self.cid + ' / ' + attached + ' : ' + expected);
                    options.success(true);
                }
            }, 0);
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
                (function getWidget(node, parent) {
                    // if the node is a widget container and the container is empty then render widget node
                    if (node.attribs && node.attribs['lazo-widget']) {
                        node.attribs.class = (node.attribs.class ? node.attribs.class + ' ' : '') + self.getStateClass('unbound');
                        node.attribs.class += ' ' + self.getStateClass('rendering');
                            expected++;
                            self._resolveWidget(node.attribs['lazo-widget'], {
                                parent: parent || self,
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
                                    if (node.children) {
                                        for (var j = 0; j < node.children.length; j++) {
                                            getWidget(node.children[j], widget);
                                        }
                                        resolved++;
                                        // ensure expected count is done
                                        setTimeout(function () {
                                            if (resolved === expected) {
                                                options.success(list);
                                            }
                                        }, 0);
                                    } else {
                                        widget.name = node.attribs['lazo-widget'];
                                        widget.render({
                                            success: function (html) {
                                                self._parse(html, {
                                                    success: function (widgetNodeList) {
                                                        node.children = widgetNodeList;
                                                        for (var k = 0; k < widgetNodeList.length; k++) {
                                                            getWidget(widgetNodeList[k], widget);
                                                        }
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
                                    }
                                },
                                error: options.error
                            });
                    }
                    if (node.children) {
                        for (var i = 0; i < node.children.length; i++) {
                            // limit scope to current view and filter out nested widgets
                            if (!node.children[i].attribs || (!node.children[i].attribs['lazo-view-id'] &&
                                !node.children[i].attribs['lazo-widget'])) {
                                getWidget(node.children[i], parent || self);
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
            var parent = options.parent;
            var definitions = options.parent.widgets || options.parent.children;

// console.log('NAME: ' + name);
// console.log(definitions);

            if (!definitions[name]) {
                options.error(new Error('[lazoWidget] Could not resolve widget "' + name + '".'));
            }

            // widget has already been resolved
            if (_.isFunction(definitions[name])) {
                return options.success(definitions[name]);
            }
            // widget is a path
            if (_.isString(definitions[name])) {
                parent._loadWidget(definitions[name], {
                    success: function (widget) {
                        definitions[name] = widget;
                        options.success(widget);
                    },
                    error: options.error
                });
            // widget is a constructor
            } else {
                options.success(definitions[name]);
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
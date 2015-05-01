define(['underscore', 'htmlparser', 'htmlparserToString', 'utils/module', 'jquery', 'uiStateMixin', 'async', 'backbone'],
    function (_, htmlParser, toString, module, $, uiStateMixin, async, Backbone) {

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
            var parent = options.parent || this;
            var $root = $(parent.el);
            var $descViews = $root.find('[lazo-view-name]');
            var $widgets = $root.find('[lazo-widget]');
            var self = this;
            var tasks = [];


            function attach(widget, parent, name, $widget, callback) {
                widget.name = name;
                widget.cid = $widget.attr('lazo-widget-id');
                widget.el = $widget[0];

                // deprecating widget.bind; transition support
                if (!widget.bind.prototype.isPrototypeOf(new Backbone.Events.on())) {
                    widget.bind($widget[0]);
                } else {
                    widget.attach($widget[0]);
                }
                widget.attached();
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
                    success: function () {
                        callback(null);
                    },
                    error: function (err) {
                        callback(err);
                    },
                    parent: widget
                });
            }

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

            // cache widgets from rendering
            parent._widgetInstances = parent.widgetInstances;
            parent.widgetInstances = {};

            $widgets.each(function () {
                var $widget = $(this);
                tasks.push(function (callback) {
                    var name = $widget.attr('lazo-widget');
                    var widget = self.getWidgetByIdName($widget.attr('lazo-widget-id'), name, parent._widgetInstances);

                    if (widget) {
                        attach(widget, parent, name, $widget, callback);
                    } else {
                        self._resolveWidget(name, {
                            parent: parent,
                            success: function (Widget) {
                                var widget = new Widget(_.extend({
                                    view: self },
                                    self._resolveWidgetElAttrs($widget[0])));

                                widget.created();
                                attach(widget, parent, name, $widget, callback);
                            },
                            error: options.error
                        });
                    }
                });
            });

            async.parallel(tasks, function (err) {
                if (err) {
                    return options.error(err);
                }

                options.success();
            });

            // clear widgets cache
            delete parent._widgetInstances;
        },

        getWidgetByIdName: function (id, name, widgets) {
            widgets = widgets || this.widgetInstances;
            widgets = widgets[name] || [];

            for (var i = 0; i < widgets.length; i++) {
                if (widgets[i].cid === id) {
                    return widgets[i];
                }
            }
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
                    var widgetId = _.uniqueId('widget');

                    // if the node is a widget container and the container is empty then render widget node
                    if (node.attribs && node.attribs['lazo-widget']) {
                        node.attribs.class = (node.attribs.class ? node.attribs.class + ' ' : '') + self.getStateClass('unbound');
                        node.attribs.class += ' ' + self.getStateClass('rendering');
                        node.attribs['lazo-widget-id'] = widgetId;
                            expected++;
                            self._resolveWidget(node.attribs['lazo-widget'], {
                                parent: parent,
                                success: function (Widget) {
                                    var name = node.attribs['lazo-widget'];
                                    var widget = new Widget(_.extend({
                                        view: self
                                    }, node.attribs));

                                    widget.created();
                                    if (widget._uiStates) {
                                        node.attribs.class = _.reduce(widget._uiStates, function (memo, state) {
                                            return memo + ' ' + self.getStateClass(state);
                                        }, node.attribs.class);
                                    }
                                    widget.name = name;
                                    widget.cid = widgetId;
                                    self._getWidgetCss(widget);
                                    if (LAZO.app.isClient) {
                                        parent.widgetInstances = parent.widgetInstances || {};
                                        parent.widgetInstances[name] = _.isArray(parent.widgetInstances[name]) ?
                                            parent.widgetInstances[name] : [];
                                        parent.widgetInstances[name].push(widget);
                                    }
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
                                // when iterating over the nodes there is no way of telling if the node is
                                // a descedent of a widget node; if it is then we don't want to resolve it
                                // because it should be resolved by the parent widget and not a parent view.
                                // the current work around is to throw an error when a widget definition
                                // cannot be found and log a debug; this error function handles this case,
                                // which is caused by line ~247
                                error: function (err) {
                                    if (err.message.indexOf('[lazoWidget] Could not resolve widget') === 0) {
                                        resolved++;
                                        LAZO.logger.debug(err.message, err);
                                        // ensure expected count is done
                                        setTimeout(function () {
                                            if (resolved === expected) {
                                                options.success(list);
                                            }
                                        }, 0);
                                    } else {
                                        options.error(err);
                                    }
                                }
                            });
                    }
                    if (node.children) {
                        for (var i = 0; i < node.children.length; i++) {
                            // limit scope to current view
                            if (!node.children[i].attribs || !node.children[i].attribs['lazo-view-id']) {
                                getWidget(node.children[i], parent || self);
                            }
                        }
                    }
                })(list[i], self);
            }

            if (!expected) {
                options.success(list);
            }
        },

        _resolveWidget: function (name, options) {
            var self = this;
            var parent = options.parent;
            var definitions = options.parent.widgets || options.parent.children;

            if (!definitions[name]) {
                return options.error(new Error('[lazoWidget] Could not resolve widget "' + name + '".'));
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

        _getWidgetCss: function (widget) {
            var self = this;
            var ctx = this.ctl.ctx;
            var rootCtx = ctx._rootCtx;
            var widgetCss;

            // add widget css to route
            if (widget.css) {
                widgetCss = _.map(_.isArray(widget.css) ? widget.css : [widget.css], function (href) {
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

        _removeWidgets: function (widgets) {
            widgets = widgets || this.widgetInstances;

            for (var k in widgets) {
                for (var i = 0; i < widgets[k].length; i++) {
                    // new markup already exists so new instances already exist
                    // if instance has an el and a parent node then it is the DOM
                    // from the previous render; else continue
                    if (!widgets[k][i].el || !widgets[k][i].el.parentNode) {
                        continue;
                    }
                    // deprecating widget.unbind; transition support
                    if (!widgets[k][i].unbind.prototype.isPrototypeOf(new Backbone.Events.off())) {
                        widgets[k][i].unbind(widgets[k][i].el);
                    } else {
                        widgets[k][i].detach(widgets[k][i].el);
                    }
                    widgets[k][i].detached();
                    if (widgets[k][i].widgetInstances) {
                        this._removeWidgets(widgets[k][i].widgetInstances);
                    }
                }
            }
        }

    }, uiStateMixin);

});
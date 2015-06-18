define(['underscore', 'utils/treeMixin'], function (_, tree) {

    'use strict';

    return _.extend({

        // Matches an HTML tag in a string of HTML based on an attribute and value.
        getInsertIndex: function (attr, val, html) {
            var regex = new RegExp('<[^<]*' + attr + '+=["||\']' + val + '["||\']+.*?>');
            return html.match(regex);
        },

        getTreeHtml: function (tree, nodeId, nodeType, callback) {
            var rootNode = tree;
            var self = this;
            var parent = tree.parent;

            this._getNodesHtml(rootNode, function (tree) {
                var html;
                // view called render; strip off surrounding component markup
                if (nodeType === 'view') {
                    // null out the parent for view rendering
                    tree.parent = null;
                    html = self._renderTree(tree);
                    var match = self.getInsertIndex(self._attrs.cmpId, rootNode.cid, html);
                    html = html.substr(match[0].length, (html.length - (match[0].length + self.closingTagLength)));
                } else {
                    html = self._renderTree(tree);
                }

                // reset parent after rendering
                tree.parent = parent;
                callback(html);
            });
        },

        getNodeHtml: function (node, callback) {
            if (this.getNodeType(node) === 'component') {
                callback('<div ' + this._attrs.cmpName + '="' + node.name + '" ' + this._attrs.cmpId + '="' + node.cid + '"></div>');
            } else {
                node.getHtml({
                    error: function (err) {
                        throw err;
                    },
                    success: function (html) {
                        callback(html);
                    }
                });
            }
        },

        closingTagLength: 6,

        _renderTree: function (component) {
            var self = this;
            return (function render(node, html) {
                html = self._assembleNodeHtml(node, html);
                if (_.size(node.children)) {
                    var children = node.children;
                    for (var k in children) {
                        for (var i = children[k].length - 1; i >= 0; i--) {
                            html = render(children[k][i], html);
                        }
                    }
                }

                return html;

            })(component, '');
        },

        _assembleNodeHtml: function (component, html) {
            var match;
            var siblings = this._getCmpSiblings(component);
            var cmpHtml = component.html.substr(0, (component.html.length - this.closingTagLength)) +
                component.currentView.html + '</div>';

            if (siblings && siblings.nodes.length) {
                var i = 0;

                while (!match && siblings.nodes[i]) { // find index of last cmp added to parent container
                    match = this.getInsertIndex(this._attrs.cmpId, siblings.nodes[i].cid, html);

                    if (match) {
                        return html.substr(0, match.index) + cmpHtml + html.substr(match.index);
                    }

                    i++;
                }
            }

            if (!match && siblings && siblings.container) {
                match = this.getInsertIndex(this._attrs.compContainerName, siblings.container, html);
            }

            if (!match && component.parent && siblings && siblings.nodes.length > 1) {
                var errMsg = 'component ' + component.name;
                throw 'The parent node for ' + errMsg + ' was not found.';
                // root component or render called from a view
            } else if (!match && (!component.parent ||
                (component.parent && siblings && siblings.nodes.length === 1))) {
                return cmpHtml;
            }

            var open = html.substr(0, match.index + match[0].length);
            var close = html.substr(match.index + match[0].length);
            return open + cmpHtml + close;
        },

        _getCmpSiblings: function (component) {
            var children = component.parent && component.parent.children;
            var siblings;

            for (var k in children) {
                if ((siblings = _.find(children[k], function (cmp) {
                    return cmp.cid === component.cid;
                }))) {
                    siblings = {
                        container: k,
                        nodes: children[k]
                    };
                    break;
                }
            }
            return siblings;
        },

        _getNodesHtml: function (tree, callback) {
            var self = this;
            var nodesToBeProcessed = 0;
            var nodesProcessed = 0;

            (function processNode(node) {
                var children = self.getNodeChildren(node);
                nodesToBeProcessed++;

                if (children.length) {
                    for (var i = 0; i < children.length; i++) {
                        processNode(children[i]);
                    }
                }

                self.getNodeHtml(node, function (html) {
                    node.html = html;
                    self.getNodeHtml(node.currentView, function (html) {
                        node.currentView.html = html;
                        // wait for processing to complete
                        setTimeout(function () {
                            nodesProcessed++;
                            if (nodesProcessed === nodesToBeProcessed) {
                                callback(tree);
                            }
                        }, 0);
                    });
                });
            })(tree);
        }

    }, tree);

});
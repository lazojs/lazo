define(['underscore'], function (_, $) {

    'use strict';

    return {

        getList: function (nodeType, rootNode) {
            var self = this,
                retVal,
                nodes = [];

            return (function flatten(nodeType, node, nodes) {
                var children;

                if (nodeType === 'view' && node.currentView) {
                    nodes.push(node.currentView);
                } else if (nodeType === 'component') {
                    nodes.push(node);
                }

                if ((children = self.getNodeChildren(node)).length) {
                    _.each(children, function (child) {
                        nodes = flatten(nodeType, child, nodes);
                    });
                }

                return nodes;
            })(nodeType, rootNode, []);
        },

        getNodeType: function (node) {
            var ret;

            if (!node) {
                ret = null;
            } else if (node.currentView) {
                ret = 'component';
            } else if (node.setElement) {
                ret = 'view';
            }

            return ret;
        },

        getNodeChildren: function (node) {
            var nodeType = this.getNodeType(node);
            if (nodeType !== 'component') {
                return [];
            }

            var children = node.children;
            var child;
            var nodes = [];
            node.currentView.parent = node;
            // nodes.push(node.currentView);
            for (var k in children) {
                for (var i = 0; i < children[k].length; i++) {
                    child = children[k][i];
                    child.parent = node;
                    nodes.push(child);
                }
            }

            return nodes;
        },

        _attrs: {
            cmpName: 'lazo-cmp-name',
            cmpId: 'lazo-cmp-id',
            compContainerName: 'lazo-cmp-container',
            viewId: 'lazo-view-id'
        }

    };

});
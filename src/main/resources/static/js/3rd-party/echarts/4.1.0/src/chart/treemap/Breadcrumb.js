/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

import * as graphic from '../../util/graphic';
import * as layout from '../../util/layout';
import * as zrUtil from 'zrender/src/core/util';
import {wrapTreePathInfo} from '../helper/treeHelper';

var TEXT_PADDING = 8;
var ITEM_GAP = 8;
var ARRAY_LENGTH = 5;

function Breadcrumb(containerGroup) {
    /**
     * @private
     * @type {module:zrender/container/Group}
     */
    this.group = new graphic.Group();

    containerGroup.add(this.group);
}

Breadcrumb.prototype = {

    constructor: Breadcrumb,

    render: function (seriesModel, api, targetNode, onSelect) {
        var model = seriesModel.getModel('breadcrumb');
        var thisGroup = this.group;

        thisGroup.removeAll();

        if (!model.get('show') || !targetNode) {
            return;
        }

        var normalStyleModel = model.getModel('itemStyle');
        // var emphasisStyleModel = model.getModel('emphasis.itemStyle');
        var textStyleModel = normalStyleModel.getModel('textStyle');

        var layoutParam = {
            pos: {
                left: model.get('left'),
                right: model.get('right'),
                top: model.get('top'),
                bottom: model.get('bottom')
            },
            box: {
                width: api.getWidth(),
                height: api.getHeight()
            },
            emptyItemWidth: model.get('emptyItemWidth'),
            totalWidth: 0,
            renderList: []
        };

        this._prepare(targetNode, layoutParam, textStyleModel);
        this._renderContent(seriesModel, layoutParam, normalStyleModel, textStyleModel, onSelect);

        layout.positionElement(thisGroup, layoutParam.pos, layoutParam.box);
    },

    /**
     * Prepare render list and total width
     * @private
     */
    _prepare: function (targetNode, layoutParam, textStyleModel) {
        for (var node = targetNode; node; node = node.parentNode) {
            var text = node.getModel().get('name');
            var textRect = textStyleModel.getTextRect(text);
            var itemWidth = Math.max(
                textRect.width + TEXT_PADDING * 2,
                layoutParam.emptyItemWidth
            );
            layoutParam.totalWidth += itemWidth + ITEM_GAP;
            layoutParam.renderList.push({node: node, text: text, width: itemWidth});
        }
    },

    /**
     * @private
     */
    _renderContent: function (
        seriesModel, layoutParam, normalStyleModel, textStyleModel, onSelect
    ) {
        // Start rendering.
        var lastX = 0;
        var emptyItemWidth = layoutParam.emptyItemWidth;
        var height = seriesModel.get('breadcrumb.height');
        var availableSize = layout.getAvailableSize(layoutParam.pos, layoutParam.box);
        var totalWidth = layoutParam.totalWidth;
        var renderList = layoutParam.renderList;

        for (var i = renderList.length - 1; i >= 0; i--) {
            var item = renderList[i];
            var itemNode = item.node;
            var itemWidth = item.width;
            var text = item.text;

            // Hdie text and shorten width if necessary.
            if (totalWidth > availableSize.width) {
                totalWidth -= itemWidth - emptyItemWidth;
                itemWidth = emptyItemWidth;
                text = null;
            }

            var el = new graphic.Polygon({
                shape: {
                    points: makeItemPoints(
                        lastX, 0, itemWidth, height,
                        i === renderList.length - 1, i === 0
                    )
                },
                style: zrUtil.defaults(
                    normalStyleModel.getItemStyle(),
                    {
                        lineJoin: 'bevel',
                        text: text,
                        textFill: textStyleModel.getTextColor(),
                        textFont: textStyleModel.getFont()
                    }
                ),
                z: 10,
                onclick: zrUtil.curry(onSelect, itemNode)
            });
            this.group.add(el);

            packEventData(el, seriesModel, itemNode);

            lastX += itemWidth + ITEM_GAP;
        }
    },

    /**
     * @override
     */
    remove: function () {
        this.group.removeAll();
    }
};

function makeItemPoints(x, y, itemWidth, itemHeight, head, tail) {
    var points = [
        [head ? x : x - ARRAY_LENGTH, y],
        [x + itemWidth, y],
        [x + itemWidth, y + itemHeight],
        [head ? x : x - ARRAY_LENGTH, y + itemHeight]
    ];
    !tail && points.splice(2, 0, [x + itemWidth + ARRAY_LENGTH, y + itemHeight / 2]);
    !head && points.push([x, y + itemHeight / 2]);
    return points;
}

// Package custom mouse event.
function packEventData(el, seriesModel, itemNode) {
    el.eventData = {
        componentType: 'series',
        componentSubType: 'treemap',
        seriesIndex: seriesModel.componentIndex,
        seriesName: seriesModel.name,
        seriesType: 'treemap',
        selfType: 'breadcrumb', // Distinguish with click event on treemap node.
        nodeData: {
            dataIndex: itemNode && itemNode.dataIndex,
            name: itemNode && itemNode.name
        },
        treePathInfo: itemNode && wrapTreePathInfo(itemNode, seriesModel)
    };
}

export default Breadcrumb;
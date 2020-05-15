wantong.cms.pageFingerAdd = (function () {
  var c, ctx, img, elementWidth, elementHeight,
      opRange = 10,//resize范围
      layerOrder = 0,
      startx,//起始x坐标
      starty,//起始y坐标
      flag,//是否点击鼠标的标志
      x,
      y,
      leftDistance,
      topDistance,
      saveScale = 0.6,  //坐标放缩值 显示图:标准图 6:10
      op = 0,//op操作类型 0 无操作 1 画矩形框 2 拖动矩形框
      scale = 1,
      type = 0,
      layers = [],//图层
      audios = [],//音频数据
      currentR,//当前点击的矩形框
      _conf = {},
      _voiceManager,
      _init = function (conf) {
        //深度合并
        $.extend(_conf, conf);
        //_conf = conf;
        console.log('canvas init', _conf);
        //初始化组件
        _initComponents();
        //清理画布
        _cleanCanvas();
        //初始化页面数据
        _loadData();
        //注册鼠标事件
        c.onmouseleave = function () {
          c.onmousedown = null;
          c.onmousemove = null;
          c.onmouseup = null;
        }
        c.onmouseenter = function () {
          c.onmousedown = mousedown;
          c.onmousemove = mousemove;
          document.onmouseup = mouseup;
        }
      },
      _getData = function() {
        _saveCurrentFingerData();
        var datas = [];
        for (var i = 0; i < layers.length; i ++) {
          datas.push(_convertPosition(layers[i], 1.0 / saveScale))
        }
        return datas;
      },
      _convertPosition = function(pos, scale) {
        var newPos = JSON.parse(JSON.stringify(pos));
        newPos.x1 = newPos.x1 * scale;
        newPos.x2 = newPos.x2 * scale;
        newPos.y1 = newPos.y1 * scale;
        newPos.y2 = newPos.y2 * scale;
        newPos.height = newPos.height * scale;
        newPos.width = newPos.width * scale;

        return newPos;
      },
      _loadData = function () {
        if (!_conf.fingerDatas) {
          return;
        }
        if (_conf.fingerDatas.length == 0) {
          return;
        }

        audios = [];
        layers = [];
        layerOrder = 0;

        var fingerDatas = _conf.fingerDatas;
        for (var i = 0; i < fingerDatas.length; i++) {
          var data = fingerDatas[i];
          if (data.pageFingerInfo && data.pageFingerInfo.position) {
            //设置layers
            var position = $.parseJSON(data.pageFingerInfo.position);
            //从后端返回的数据 需缩小坐标信息
            if (position.shapeType) {
              //FIXME 新的数据结构类型
            } else {
              position = _convertPosition(position, saveScale);
              position.name = '';
              drawIndex(position);
              layers.push(position);
            }
          }
          if (data.voice) {
            position.voice = data.voice;
            _tagEditingData(position.voice);
          }
          if (data.pageFingerInfo && data.pageFingerInfo.extraData) {
            position.extraData = data.pageFingerInfo.extraData;
          }
          if (data.pageFingerInfo && data.pageFingerInfo.id) {
            position.id = data.pageFingerInfo.id;
          }
        }

        //重绘框体
        ctx.clearRect(0, 0, elementWidth, elementHeight);
        reshow();
        console.log('layers', layers, audios);
        //首次打开 激活第一个
        _activeLayerEdit($('.layer-inputs .layer-input-warpper').first().attr('name'));
      },
      _tagEditingData = function (voiceData) {
        if (voiceData.voice && voiceData.voice.length > 0) {
          for (var i = 0; i < voiceData.voice.length; i++) {
            voiceData.voice[i].editingMode = true;
            voiceData.voice[i].finger = true;
          }
        }
        if (voiceData.bgMusic && voiceData.bgMusic.length > 0) {
          for (var i = 0; i < voiceData.bgMusic.length; i++) {
            voiceData.bgMusic[i].editingMode = true;
            voiceData.bgMusic[i].finger = true;
          }
        }
        if (voiceData.effectSound && voiceData.effectSound.length > 0) {
          for (var i = 0; i < voiceData.effectSound.length; i++) {
            voiceData.effectSound[i].editingMode = true;
            voiceData.effectSound[i].finger = true;
          }
        }
      },
      _reverseVoice = function (voiceData) {
        if (voiceData.voice && voiceData.voice.length > 0) {
            voiceData.voice = voiceData.voice.reverse();
        }
        if (voiceData.bgMusic && voiceData.bgMusic.length > 0) {
            voiceData.bgMusic = voiceData.bgMusic.reverse();
        }
        if (voiceData.effectSound && voiceData.effectSound.length > 0) {
            voiceData.effectSound = voiceData.effectSound.reverse();
        }

        return voiceData;
      },
      _saveCurrentFingerData = function() {
        var curName = $('.layer-inputs .active-warpper').attr('name');
        var curLayer = _getTargetLayer(curName);
        if (curLayer) {
          curLayer.voice = _reverseVoice(_voiceManager.getData());
          curLayer.nickname = $('.layer-inputs .active-warpper input').val();
          curLayer.extraData = $('#extra-data #extraDataText').val();
          console.log('~~~~~~~~~~~~~~~~save~~~~~~~~~~~~~~~~~~~~~', curLayer.voice);
        }
      },
      _activeLayerEdit = function (name) {
        //切换tab 保存当页数据
        _saveCurrentFingerData();

        //切换新页面数据
        console.log('toggle', name);
        $('.layer-inputs').children('.layer-input-warpper').removeClass(
            'active-warpper');
        $('.layer-inputs .layer-input-warpper[name="' + name + '"]').addClass(
            'active-warpper');
        var tarLayer = _getTargetLayer(name);
        if (tarLayer) {
          _conf.voice = tarLayer == null ? null : tarLayer.voice;
          _voiceManager.renewAll();
          _voiceManager.loadData(_conf, true);
          console.log('setExtraData');
          wantong.cms.pageAdd.setExtraData(tarLayer.extraData);
        }
      },
      _getTargetLayer = function (name) {
        for (var i = 0; i < layers.length; i++) {
          if (layers[i].name == name) {
            return layers[i];
          }
        }
        return null;
      },
      _voiceDisplayControl = function(val) {
        if (val) {
          $('#voiceManager').show();
          $('.voice-progress-bar').show();
          $('#extra-data').show();
        } else {
          $('#voiceManager').hide();
          $('.voice-progress-bar').hide();
          $('#extra-data').hide();
        }
      },
      _initComponents = function () {
        _voiceManager = wantong.cms.pageAdd.voiceManager;
        //全局面板控制
        wantong.cms.pageAdd.initExtraDataSymbolBtn();
        _voiceDisplayControl(false);
        //初始化画框
        c = document.getElementById("myCanvas");
        ctx = c.getContext("2d");
        img = document.createElement('img');
        elementWidth = c.clientWidth, elementHeight = c.clientHeight;
        $('.index-container').css('height', elementHeight);
        $('.layer-inputs').css('height', elementHeight);
        $('.index-container').css('margin-top',
            '-' + (elementHeight + 5) + 'px');
        img.src = "/cms/perspectiveImg.do?" + "bookId=" + _conf.baseBookId
            + "&imageId=" + _conf.imageId + "&modelId=" + _conf.modelId;
        img.onload = function () {
          if (img.width > 0) {
            saveScale = (1.0 * c.width) / img.width;
            console.log('scale:', saveScale);
          }
          c.style.backgroundImage = "url(" + img.src + ")";
          c.style.backgroundSize = `${c.width}px ${c.height}px`;
        }
      },
      _cleanCanvas = function () {
        layerOrder = 0;
        layers = [];
        //重绘框体
        ctx.clearRect(0, 0, elementWidth, elementHeight);
        reshow();
        //清除层信息
        $('.index-container').html('');
        $('.layer-inputs').html('');
      },
      // resize操作
      resizeMove = function (rect) {
        c.style.cursor = "move";
        if (flag && op == 0) {
          op = 11;
        }
        if (flag && op == 11) {
          if (!currentR) {
            currentR = rect
          }
          currentR.x2 += x - leftDistance - currentR.x1;
          currentR.x1 += x - leftDistance - currentR.x1;
          currentR.y2 += y - topDistance - currentR.y1;
          currentR.y1 += y - topDistance - currentR.y1;
        }
        drawIndex(rect);
      },
      resizeLeft = function (rect) {
        c.style.cursor = "w-resize";
        if (flag && op == 0) {
          op = 3;
        }
        if (flag && op == 3) {
          if (!currentR) {
            currentR = rect
          }
          currentR.x1 = x
          currentR.width = currentR.x2 - currentR.x1
        }
      },
      resizeTop = function (rect) {
        c.style.cursor = "s-resize";
        if (flag && op == 0) {
          op = 4;
        }
        if (flag && op == 4) {
          if (!currentR) {
            currentR = rect
          }
          currentR.y1 = y
          currentR.height = currentR.y2 - currentR.y1
        }
      },
      resizeWidth = function (rect) {
        c.style.cursor = "w-resize";
        if (flag && op == 0) {
          op = 5;
        }
        if (flag && op == 5) {
          if (!currentR) {
            currentR = rect
          }
          currentR.x2 = x
          currentR.width = currentR.x2 - currentR.x1
        }
      },
      resizeHeight = function (rect) {
        c.style.cursor = "s-resize";
        if (flag && op == 0) {
          op = 6;
        }
        if (flag && op == 6) {
          if (!currentR) {
            currentR = rect
          }
          currentR.y2 = y
          currentR.height = currentR.y2 - currentR.y1
        }
      },
      resizeLT = function (rect) {
        c.style.cursor = "se-resize";
        if (flag && op == 0) {
          op = 7;
        }
        if (flag && op == 7) {
          if (!currentR) {
            currentR = rect
          }
          currentR.x1 = x
          currentR.y1 = y
          currentR.height = currentR.y2 - currentR.y1
          currentR.width = currentR.x2 - currentR.x1
        }
      },
      resizeWH = function (rect) {
        c.style.cursor = "se-resize";
        if (flag && op == 0) {
          op = 8;
        }
        if (flag && op == 8) {
          if (!currentR) {
            currentR = rect
          }
          currentR.x2 = x
          currentR.y2 = y
          currentR.height = currentR.y2 - currentR.y1
          currentR.width = currentR.x2 - currentR.x1
        }
      },
      resizeLH = function (rect) {
        c.style.cursor = "ne-resize";
        if (flag && op == 0) {
          op = 9;
        }
        if (flag && op == 9) {
          if (!currentR) {
            currentR = rect
          }
          currentR.x1 = x
          currentR.y2 = y
          currentR.height = currentR.y2 - currentR.y1
          currentR.width = currentR.x2 - currentR.x1
        }
      },
      resizeWT = function (rect) {
        c.style.cursor = "ne-resize";
        if (flag && op == 0) {
          op = 10;
        }
        if (flag && op == 10) {
          if (!currentR) {
            currentR = rect
          }
          currentR.x2 = x
          currentR.y1 = y
          currentR.height = currentR.y2 - currentR.y1
          currentR.width = currentR.x2 - currentR.x1
        }
      },
      reshow = function (x, y) {
        if (layers.length == 0) {
          _voiceDisplayControl(false);
        }
        var lineGradient = ctx.createLinearGradient(0, 0, 0, 200);
        lineGradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)');

        let allNotIn = 1;
        layers.forEach(item => {
          // if (item.name != opLayer) {
          //   return;
          // }

          ctx.beginPath();
          ctx.rect(item.x1, item.y1, item.width, item.height);
          ctx.strokeStyle = item.strokeStyle
          if (x >= (item.x1 - opRange / scale) && x <= (item.x1 + opRange
              / scale) && y
              <= (item.y2 - opRange / scale) && y >= (item.y1 + opRange
                  / scale)) {
            resizeLeft(item);
            //resizeMove(item);
          } else if (x >= (item.x2 - opRange / scale) && x <= (item.x2 + opRange
              / scale)
              && y
              <= (item.y2 - opRange / scale) && y >= (item.y1 + opRange
                  / scale)) {
            resizeWidth(item)
            //resizeMove(item);
          } else if (y >= (item.y1 - opRange / scale) && y <= (item.y1 + opRange
              / scale)
              && x
              <= (item.x2 - opRange / scale) && x >= (item.x1 + opRange
                  / scale)) {
            resizeTop(item);
            //resizeMove(item);
          } else if (y >= (item.y2 - opRange / scale) && y <= (item.y2 + opRange
              / scale)
              && x
              <= (item.x2 - opRange / scale) && x >= (item.x1 + opRange
                  / scale)) {
            resizeHeight(item);
            //resizeMove(item);
          } else if (x >= (item.x1 - opRange / scale) && x <= (item.x1 + opRange
              / scale)
              && y
              <= (item.y1 + opRange / scale) && y >= (item.y1 - opRange
                  / scale)) {
            resizeLT(item);
          } else if (x >= (item.x2 - opRange / scale) && x <= (item.x2 + opRange
              / scale)
              && y
              <= (item.y2 + opRange / scale) && y >= (item.y2 - opRange
                  / scale)) {
            resizeWH(item);
          } else if (x >= (item.x1 - opRange / scale) && x <= (item.x1 + opRange
              / scale)
              && y
              <= (item.y2 + opRange / scale) && y >= (item.y2 - opRange
                  / scale)) {
            resizeLH(item);
          } else if (x >= (item.x2 - opRange / scale) && x <= (item.x2 + opRange
              / scale)
              && y
              <= (item.y1 + opRange / scale) && y >= (item.y1 - opRange
                  / scale)) {
            resizeWT(item);
          }
          if (ctx.isPointInPath(x * scale, y * scale)) {
            //console.log('inPath');
            render(item);
            allNotIn = 0;
            drawIndex(item);
            //灰色底纹
            ctx.fillStyle = lineGradient;
            ctx.fillRect(item.x1, item.y1, item.width, item.height);
          }
          ctx.stroke();
        });

        if (flag && allNotIn && op < 3) {
          op = 1;
        }
      },
      render = function (rect) {
        c.style.cursor = "move";
        if (flag && op == 0) {
          op = 2;
        }
        if (flag && op == 2) {
          if (!currentR) {
            currentR = rect
          }
          currentR.x2 += x - leftDistance - currentR.x1;
          currentR.x1 += x - leftDistance - currentR.x1;
          currentR.y2 += y - topDistance - currentR.y1;
          currentR.y1 += y - topDistance - currentR.y1;
        }
      },
      isPointInRetc = function (x, y) {
        let len = layers.length;
        for (let i = 0; i < len; i++) {
          if (layers[i].x1 - opRange < x && x < layers[i].x2 + opRange && layers[i].y1 - opRange < y && y
              < layers[i].y2 + opRange) {
            console.log('isPointInRetc', layers[i]);
            return layers[i];
          }
        }
      },
      fixPosition = function (position) {
        if (position.x1 > position.x2) {
          let x = position.x1;
          position.x1 = position.x2;
          position.x2 = x;
        }
        if (position.y1 > position.y2) {
          let y = position.y1;
          position.y1 = position.y2;
          position.y2 = y;
        }
        position.width = position.x2 - position.x1
        position.height = position.y2 - position.y1
        if (position.width < 30 || position.height < 30) {
          console.log(position.width, position.height);
          position.width = 30;
          position.height = 30;
          position.x2 = position.x1 + 30;
          position.y2 = position.y1 + 30;
        }
        //交替大小点

        return position;
      },

      //鼠标事件
      mousedown = function (e) {
        //console.log('down', e.pageX, c.offsetLeft, e.offsetX ,c.parentElement.scrollLeft);
        startx = e.offsetX / scale; //(e.pageX - c.offsetLeft + c.parentElement.scrollLeft) / scale;
        starty = e.offsetY / scale; //(e.pageY - c.offsetTop + c.parentElement.scrollTop) / scale;
        currentR = isPointInRetc(startx, starty);
        console.log('x,y', x, y);
        if (currentR) {
          leftDistance = startx - currentR.x1;
          topDistance = starty - currentR.y1;
          _activeLayerEdit(currentR.name);
        }
        ctx.strokeRect(x, y, 0, 0);
        ctx.strokeStyle = "#FF0000";
        flag = 1;
      },
      mousemove = function (e) {
        x = e.offsetX / scale; //(e.pageX - c.offsetLeft + c.parentElement.scrollLeft) / scale;
        y = e.offsetY / scale; //(e.pageY - c.offsetTop + c.parentElement.scrollTop) / scale;
        ctx.save();
        ctx.setLineDash([5])
        c.style.cursor = "default";
        ctx.clearRect(0, 0, elementWidth, elementHeight)
        if (flag && op == 1) {
          ctx.strokeRect(startx, starty, x - startx, y - starty);
        }
        ctx.restore();
        reshow(x, y);
      },
      mouseup = function (e) {
        wantong.cms.pageAdd.setSaveNextButtonState(true);
        if (op == 1) {
          console.log('type', type);
          let position = fixPosition({
            id: 0,
            x1: startx,
            y1: starty,
            x2: x,
            y2: y,
            strokeStyle: '#FF0000',
            type: type,
            name: '',
            nickname: '',
            extraData: '',
            voice: {
              bgMusic: [],
              effectSound: [],
              voice: []
            }
          });

          drawIndex(position);
          layers.push(position);
          _activeLayerEdit(position.name);
        } else if (op >= 3) {
          fixPosition(currentR)
        }
        currentR = null;
        flag = 0;
        reshow(x, y);
        op = 0;
      },
      //序号容器方法集
      drawIndex = function (position) {
        var layerName = '';
        var newIndex = true;
        var $dom, $layerWarpper;
        if (position.name == '') {
          newIndex = true;
          layerName = 'layer' + ++layerOrder;
          $dom = $('<div class="layer-warpper"><div class="layer-index">'
              + layerOrder
              + '</div></div>');
          $layerWarpper = $(
              '<div class="layer-input-warpper"><label>' + layerOrder
              + '</label><input class="layer-name"><span class="delete-btn glyphicon glyphicon-remove-sign" aria-hidden="true"></span></div>');
          position.nickname = position.nickname == '' ? ('区域' + layerOrder)
              : position.nickname;
          $layerWarpper.find('input').val(position.nickname);
          $layerWarpper.find('.delete-btn').on('click', function () {
            var layerName = $(this).parent().attr('name');
            layer.confirm('确定要删除吗？删除后该点击区域下资源会被删除', {
              btn: ['确定','取消'] //按钮
            }, (index) => {
              if ($(this).parent().hasClass('active-warpper')) {
                //删除事件
                var next = $(this).parent().prev() ? $(this).parent().prev() : $(this).parent().next();
                deleteIndex(layerName, true);
                _activeLayerEdit(next ? next.attr('name') : $('.layer-inputs .layer-input-warpper').first().attr('name'));
              } else {
                deleteIndex(layerName, false);
              }
              layer.close(index);
            },()=> {});
          });
          $layerWarpper.on('click', function () {
            _activeLayerEdit($(this).attr('name'));
          });

          $layerWarpper.mouseover(function() {
            $(this).find('.delete-btn').css('visibility', 'visible');
          }).mouseout(function() {
            $(this).find('.delete-btn').css('visibility', 'hidden');
          });

        } else {
          newIndex = false;
          layerName = position.name;
          $dom = $('.index-container [name="' + layerName + '"]');
          $layerWarpper = $(
              '.layer-inputs .layer-input-warpper[name="' + layerName + '"]');
        }

        //定位序号容器
        $dom.css('top', position.y1 * scale + 'px');
        $dom.css('left', position.x1 * scale + 'px');
        //标记层级名
        $dom.attr('name', layerName);
        $layerWarpper.attr('name', layerName);
        //定义序号容器宽高
        //var width = position.x2 - position.x1;
        //var height = position.y2 - position.y1;
        //$dom.css('width', width).css('height', height);

        if (newIndex) {
          $('.index-container').append($dom);
          $('.layer-inputs').append($layerWarpper);
        }
        _voiceDisplayControl(true);
        position.name = layerName;
        return layerName;
      },
      deleteIndex = function (layerName, cleanVoice) {
        //删除序号信息
        $('.index-container [name="' + layerName + '"]').remove();
        //删除输入框
        $('.layer-inputs .layer-input-warpper[name="' + layerName
            + '"]').remove();
        //删除层中数据
        layers.splice(layers.findIndex(item => item.name === layerName), 1);
        console.log('length', layers.length);

        //重新排序
        for (layerOrder = 0; layerOrder < layers.length; layerOrder++) {
          var l = layers[layerOrder];
          var lName = 'layer' + (layerOrder + 1);
          console.log(l.name, lName);
          if (l.name != lName) {
            //更新名字
            $dom = $('.index-container [name="' + l.name + '"]').attr('name',
                lName).find('.layer-index').text(layerOrder + 1);
            $layerWarpper = $(
                '.layer-inputs .layer-input-warpper[name="' + l.name
                + '"]').attr(
                'name', lName).find('label').text(layerOrder + 1);
            l.name = lName;
          }
        }

        console.log('after delete', layers);
        //清空 语音面板数据
        if (cleanVoice) {
          _voiceManager.renewAll();
        }
        //重绘框体
        ctx.clearRect(0, 0, elementWidth, elementHeight);
        reshow();
      };
  return {
    init: function (conf) {
      _init(conf);
    },
    getData: function() {
      return _getData();
    }
  }
})();
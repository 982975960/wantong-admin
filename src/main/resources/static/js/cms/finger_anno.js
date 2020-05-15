wantong.cms.pageFingerAdd = (function () {
      var
          layerOrder = 0,
          scale = 1,
          layers = [],//图层
          audios = [],//音频数据
          currentR,//当前点击的矩形框
          imgUrl,
          LOAD_PAGE_INFO = "cms/loadPageFingerInfo.do",
          _conf = {},
          _waitLoad = null,
          _voiceManager,
           _init = function (conf, lastName) {
            console.log('via init ', conf);
            $.extend(_conf, conf);
             _waitLoad = lastName;
            console.log('canvas init', _conf, lastName);
            _bindEvent();
            _loadOnlyToggle();
            //初始化VIA 初始化完后会回调 _via_load_submodules方法 再来初始化数据
            _via_init();
          },
          _loadOnlyToggle = function() {
            var checked = localStorage.getItem("ONLY_CLICK_TOGGLE") === 'true';
            $('.control-menu #toggleRegion').prop('checked', checked);
            _setOnlyToggle();
          },
          _setOnlyToggle = function() {
            var checked = $('.control-menu #toggleRegion').prop('checked');
            ONLY_CLICK_TOGGLE = checked;
            localStorage.setItem("ONLY_CLICK_TOGGLE", checked);
          },
          _bindEvent = function () {
            $('.control-menu label').click(function() {
              $('#toggleRegion').click();
            });
            $('#toggleRegion').click(function(e) {
              _setOnlyToggle();
            });
            $('#rectBtn').click(function () {
              setRect(true);
            });
            $('#polygonBtn').click(function () {
              setRect(false);
            });
            $('#exportBtn').click(function () {
              exportMeta();
            });

            //$('.via-container').onresize = _via_update_ui_components();
          },
          _via_load_submodules = function () {
            //via_init 初始化调用附属模块
            //注册画布事件回调
            finish_draw_recall = drawRegionFinish;
            click_canvas_recall = chooseRegion;
            click_selected_recall = function() {
              $('#saveAndNextButton').removeAttr('disabled');
            }
            //设置绘图类型
            setRect(true);
            //load_by_url('https://files-dev.51wanxue.cn/dev-brs/content/basebook/27/4608/62661f05-ce00-4d05-aff6-bdf28ae652af_perspective.jpg');
            //初始化组件
            _initComponents();
            //清理画布
            _cleanCanvas();
            //初始化页面数据
            _loadData();
          },
          exportMeta = function () {
            //导出json数据
            console.log(_via_img_metadata);
            console.log(layers);
            //delete_all_region();
          },
          drawRegionFinish = function (type, region_id) {
            console.log('draw finish', type, region_id);
            wantong.cms.pageAdd.setSaveNextButtonState(true);
            console.log('type', type);
            let position = {
              id: 0,
              x1: 0,
              y1: 0,
              x2: 0,
              y2: 0,
              strokeStyle: '#FF0000',
              type: 0,
              name: '',
              nickname: '',
              extraData: '',
              evalText: '',
              videoText: '',
              voice: {
                bgMusic: [],
                effectSound: [],
                voice: []
              }
            };

            $('#saveAndNextButton').removeAttr('disabled');
            _drawIndex(position);
            layers.push(position);
            _activeLayerEdit(position.name);
          },
          chooseRegion = function (region_id) {
            console.log('click index', region_id);
            if (region_id > -1) {
              _voiceDisplayControl(true);
              _activeLayerEdit(layers[region_id].name);
            } else {
              _voiceDisplayControl(false);
              if (currentR == name) {
                console.log('eqal', name);
                return;
              }

              //切换tab 保存当页数据
              currentR = null;
              _saveCurrentFingerData();

              $('.layer-inputs').children('.layer-input-warpper').removeClass(
                  'active-warpper');

            }
          },
          load_by_url = function (url) {
            if (url !== '') {
              url = url.trim();
              //加入全局图片存储
              var img_id = project_file_add_url(url);
              //获得加入的图片文件列下标
              var img_index = _via_image_id_list.indexOf(img_id);
              show_message('Added file at url [' + url + ']');
              //前端显示列表更新
              update_img_fn_list();
              //显示新当如的图
              _via_show_img(img_index);
            }
          },
          setRect = function (val) {
            if (val) {
              document.getElementById("polygonBtn").classList.remove(
                  'selected');
              document.getElementById("rectBtn").classList.add('selected');
              select_region_shape('rect');
            } else {
              document.getElementById("polygonBtn").classList.add('selected');
              document.getElementById("rectBtn").classList.remove('selected');
              select_region_shape('polygon');
            }
          },
          _getData = function () {
            _saveCurrentFingerData();

            return _combineViaData();
          },
          _convertPosition = function (pos) {
            pos.shapeType = 0;
            pos.shape = [];
            var minPoint = {
              x: pos.x1,
              y: pos.y1
            };
            var maxPoint = {
              x: pos.x2,
              y: pos.y2
            };
            pos.shape.push(minPoint);
            pos.shape.push(maxPoint);
            delete (pos.x1);
            delete (pos.x2);
            delete (pos.y1);
            delete (pos.y2);
            delete (pos.width);
            delete (pos.height);
            delete (pos.type);

            return pos;
          },
          _convertLayersToVia = function (layers) {
            //console.log(layers);
            var regions = [];
            for (var i = 0; i < layers.length; i++) {
              var layer = layers[i];
              var shape = {};

              //定义类型
              if (layer.shapeType == 0) {
                //矩形
                shape.name = "rect";
                shape.height = layer.shape[1].y - layer.shape[0].y;
                shape.width = layer.shape[1].x - layer.shape[0].x;
                shape.x = layer.shape[0].x;
                shape.y = layer.shape[0].y;
              } else {
                shape.name = "polygon";
                //定义坐标点
                shape.all_points_x = [];
                shape.all_points_y = [];
                for (var j = 0; j < layer.shape.length; j++) {
                  shape.all_points_x.push(layer.shape[j].x);
                  shape.all_points_y.push(layer.shape[j].y);
                }
              }

              var region = {
                region_attributes: {},
                shape_attributes: shape,
                //customer: layer
              };

              regions.push(region);
            }

            var data = {};
            var jd = imgUrl + '-1';
            data[jd] = {
              filename: imgUrl,
              size: -1,
              regions: regions,
              file_attributes: {
                caption: "perspective",
                public_domain: "no",
                image_url: imgUrl
              }
            };

            console.log('convert data', data);
            return data;
          },
          _combineViaData = function () {
            console.log(_via_img_metadata);
            console.log(layers);
            var jd = imgUrl + '-1';
            var regions = _via_img_metadata[jd].regions;
            for (var i = 0; i < layers.length; i++) {
              var layer = layers[i];
              var region = regions[i];
              var shape = region.shape_attributes;
              layer.shape = [];
              if (shape.name == 'rect') {
                layer.shapeType = 0;
                var minP = {
                  x: shape.x,
                  y: shape.y
                };
                var maxP = {
                  x: shape.x + shape.width,
                  y: shape.y + shape.height
                };
                layer.shape.push(minP);
                layer.shape.push(maxP);
              } else {
                layer.shapeType = 1;
                for (var j = 0; j < shape.all_points_x.length; j++) {
                  layer.shape.push({
                    x: shape.all_points_x[j],
                    y: shape.all_points_y[j]
                  })
                }
              }
            }


            console.log(layers);
            var curName = $('.layer-inputs .active-warpper').attr('name');
            var d = {
              layers: layers,
              name: curName
            }

            return d;
          },
          _resize= function() {
            var WIDTH_BORDER = 25;
            var containerWidth = $('#bookEdit').width();
            var inputsWidth = $('.right-container').css('display')=='none' ? 0 : $('.right-container').width();
            console.log("width", containerWidth, inputsWidth, containerWidth - inputsWidth);
            $('#picManager').width(containerWidth - inputsWidth - WIDTH_BORDER);
            var managerWidth = $('#picManager').width();
            $('.via-container').css('max-width', managerWidth + 'px');

            //音频适应
            $('#voiceManager').css('min-width', '900px');
            $('#bookEdit .voice-progress-bar').css('min-width', '900px');
            $('#voiceManager').css('width', (containerWidth- WIDTH_BORDER) + 'px');
            $('#bookEdit .voice-progress-bar').css('width', (containerWidth - WIDTH_BORDER) + 'px');

            console.log('pannel width', managerWidth - WIDTH_BORDER);
            manager_width = managerWidth;
            pannel_width = manager_width - WIDTH_BORDER;//'1012';//'756';
            // pannel_height = managerWidth - 25;//'537'//'393';
          },
          _loadData = function () {
            /*
          * 添加查看扫描图功能
          * @since Sprint7
          */
            if (!_conf.fingerDatas && _conf.viewMode !== true) {
              //编辑点读区域
              return;
            }
            _resize();

            audios = [];
            layers = [];
            layerOrder = 0;
            //热区坐标 userFingerDatas为扫描图坐标
            var fingerDatas = null;
            if(_conf.viewMode === true){
              if(_conf.scanType === 0){
                fingerDatas = _conf.userFingerDatasDTOS[0].userFingerDatas;
              } else {
                for (let i = 0; i <_conf.userFingerDatasDTOS.length ; i++) {
                  if(_conf.userFingerDatasDTOS[i].scanType == _conf.scanType){
                    fingerDatas = _conf.userFingerDatasDTOS[i].userFingerDatas;
                  }
                }
              }
            } else {
              fingerDatas = _conf.fingerDatas;
            }
            console.log(fingerDatas);
             // = _conf.viewMode === true ? _conf.userFingerDatasDTOS : _conf.fingerDatas;
            for (var i = 0; i < fingerDatas.length; i++) {
              var data = fingerDatas[i];
              if (data.pageFingerInfo && data.pageFingerInfo.position) {
                //设置layers
                var position = $.parseJSON(data.pageFingerInfo.position);
                if (position.hasOwnProperty('shapeType')) {
                  // 新的数据结构类型 直接使用
                  console.log('new');
                } else {
                  position = _convertPosition(position);
                }

                position.name = '';
                _drawIndex(position);
                layers.push(position);
              }

              if (data.voice) {
                position.voice = data.voice;
                _tagEditingData(position.voice);
              }
              if (data.pageFingerInfo && data.pageFingerInfo.extraData) {
                position.extraData = data.pageFingerInfo.extraData;
              }
              if (data.pageFingerInfo && data.pageFingerInfo.evalText) {
                position.evalText = data.pageFingerInfo.evalText;
              }
              if (data.pageFingerInfo && data.pageFingerInfo.videoText) {
                position.videoText = data.pageFingerInfo.videoText;
              }
              if (data.pageFingerInfo && data.pageFingerInfo.id) {
                position.id = data.pageFingerInfo.id;
              }
            }

            //重绘框体
            //project_remove_file(imgUrl + '-1');
            delete_all_region();
            console.log('layers', layers, audios);

            //初始化画框
            if (_conf.viewMode === true){
              //查看扫描图模式
              if(_conf.scanType == 0){
                imgUrl = _conf.userFingerDatasDTOS[0].sscannogramURL;
              } else {
                for (let i = 0; i < _conf.userFingerDatasDTOS.length; i++) {
                  if(_conf.scanType == _conf.userFingerDatasDTOS[i].scanType){
                    imgUrl = _conf.userFingerDatasDTOS[i].sscannogramURL;
                    break;
                  }
                }
              }

            }else {
              imgUrl = "/cms/perspectiveImg.do?" + "bookId=" + _conf.baseBookId
                  + "&imageId=" + _conf.imageId + "&modelId=" + _conf.modelId;
            }
            console.log('imgUrl', imgUrl);
            //load_by_url(imgUrl);
            //导入json点数据
            //annotations_json = '{"https://files-dev.51wanxue.cn/dev-brs/content/basebook/27/4608/62661f05-ce00-4d05-aff6-bdf28ae652af_perspective.jpg-1":{"filename":"https://files-dev.51wanxue.cn/dev-brs/content/basebook/27/4608/62661f05-ce00-4d05-aff6-bdf28ae652af_perspective.jpg","layer":"layer1","size":-1,"regions":[{"shape_attributes":{"name":"polygon","layer":"layer1","all_points_x":[116,94,176,343,383,385,369,406,398,364,310,297,304,244,158],"all_points_y":[157,195,264,273,261,234,222,216,155,124,135,170,188,170,175]},"region_attributes":{}}],"file_attributes":{"caption":"perspective","public_domain":"no","image_url":"https://files-dev.51wanxue.cn/dev-brs/content/basebook/27/4608/62661f05-ce00-4d05-aff6-bdf28ae652af_perspective.jpg"}}}';
            import_annotations_from_json_obj(
                _convertLayersToVia(layers)).then(
                function () {
                  var id = imgUrl+'-1';
                  var index = _via_image_id_list.indexOf(id);
                  _via_show_img(index);
                  //首次打开 激活第一个 或 上次保存的
                  var interval = setInterval(function() {
                        if (_via_img_metadata[id] && _via_img_metadata[id].regions && _via_image_id == id) {
                          var height = $('#region_canvas').height();
                          $('.layer-inputs').css('height', (height - 70) + 'px');
                          console.log('height', height);
                          //载入右侧框
                          clearInterval(interval);
                          wantong.cms.pageAdd.resizeCalc(false);
                          console.log('finish load via');
                          if (_getTargetIndex(_waitLoad) != -1) {
                            _activeLayerEdit(_waitLoad);
                          } else {
                            _activeLayerEdit($('.layer-inputs .layer-input-warpper').first().attr('name'));
                          }
                        }
                      });
                  //主动选择region
                  //console.log('loadfinish');
                  //_select_region(0);
                });
            //转换到via格式


          },
          _saveCurrentFingerData = function () {
            var curName = $('.layer-inputs .active-warpper').attr('name');
            var curLayer = _getTargetLayer(curName);
            if (curLayer) {
              curLayer.voice = _reverseVoice(_voiceManager.getData());
              curLayer.nickname = $(
                  '.layer-inputs .active-warpper input').val();
              curLayer.extraData = $('#extra-data #extraDataText').val();
              curLayer.evalText = $('.eval-text #evalText').val();
              curLayer.videoText = $('.video-text #videoText').val();
              console.log('~~~~~~~~~~~~~~~~save~~~~~~~~~~~~~~~~~~~~~',
                  curLayer.voice);
            }
          },
          _activeLayerEdit = function (name) {
            if (currentR == name) {
              console.log('eqal', name);
              return;
            }

            currentR = name;
            $('.voice-test-btn-stop').click();
            //切换tab 保存当页数据
            _saveCurrentFingerData();

            //切换新页面数据
            console.log('toggle', name);
            $('.layer-inputs').children('.layer-input-warpper').removeClass(
                'active-warpper');
            $('.layer-inputs .layer-input-warpper[name="' + name
                + '"]').addClass(
                'active-warpper');
            var tarLayer = _getTargetLayer(name);
            if (tarLayer) {
              _conf.voice = tarLayer.voice;
              _voiceManager.voiceTestStop();
              _voiceManager.renewAll();
              _voiceManager.loadData(_conf, true);
              console.log('setExtraData');
              wantong.cms.pageAdd.setExtraData(tarLayer.extraData);
              $('.eval-text #evalText').val(tarLayer.evalText);
              $('.video-text #videoText').val(tarLayer.videoText);
              var index = _getTargetIndex(name);
              _select_region(_getTargetIndex(name));
              if(index > -1) {
               setRect(_via_img_metadata[_via_image_id].regions[index].shape_attributes.name == "rect");
              }
            } else {
              _voiceDisplayControl(false);
            }
          },
          _reloadAudioData = function(pageId) {
            console.log('_reloadAudioData' , '_updateChangeAudioRow');
            $.ajax({
              url: LOAD_PAGE_INFO,
              type: "GET",
              async: false,
              data: {
                pageId: pageId
              },
              success: function (data) {
                if (data.code==0 && data.data.fingerDatas) {
                  _updateAudio(data.data.fingerDatas);
                }
              }
            });
          },
          _updateAudio = function(fingerDatas) {
            //更新绑定数据
            for (var i = 0; i < fingerDatas.length; i++) {
              var data = fingerDatas[i];
              if (data.voice) {
                var position = _getLayerDataById(data.pageFingerInfo.id);
                if (position) {
                  position.voice = data.voice;
                  _tagEditingData(position.voice);
                }
              }
            }
            //更新语音面板
            //_updateChangeAudioRow
            var curName = $('.layer-inputs .active-warpper').attr('name');
            var curLayer = _getTargetLayer(curName);
            if (curLayer) {
              if (curLayer.voice && curLayer.voice.voice) {
                wantong.cms.pageAdd.voiceManager.updateChangeAudioRow(curLayer.voice.voice);
              }

              console.log('reshow voice');
            }
          },
          _getLayerDataById = function(id) {
            for (var i = 0; i < layers.length; i++) {
              var position = layers[i];
              if (position.id == id) {
                return position;
              }
            }

            return null;
          },
          _getTargetIndex = function (name) {
            for (var i = 0; i < layers.length; i++) {
              if (layers[i].name == name) {
                return i;
              }
            }
            return -1;
          },
          _getTargetLayer = function (name) {
            var i = _getTargetIndex(name);
            console.log(i);
            return i == -1 ? null : layers[i];
          },
          _voiceDisplayControl = function (val) {
            if (val) {
              $('#voiceManager').show();
              $('.voice-progress-bar').show();
              $('#extra-data').show();
              $('.eval-text').show();
            } else {
              $('#voiceManager').hide();
              $('.voice-progress-bar').hide();
              $('#extra-data').hide();
              $('.eval-text').hide();
            }
          },
          _initComponents = function () {
            _voiceManager = wantong.cms.pageAdd.voiceManager;
            //全局面板控制
            wantong.cms.pageAdd.initExtraDataSymbolBtn();
            //wantong.cms.pageAdd.setSaveNextButtonState(false);
            _voiceDisplayControl(false);
          },
          _cleanCanvas = function () {
            layerOrder = 0;
            layers = [];
            currentR = null;
            //重绘框体
            delete_all_region();
            //清除层信息
            $('.index-container').html('');
            $('.layer-inputs').html('');
          },
          //序号容器方法集
          _drawIndex = function (position) {
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
              position.nickname = position.nickname == '' ? ('区域'
                  + layerOrder)
                  : position.nickname;
              //置自定义名字
              $layerWarpper.find('input').val(position.nickname);
              //内容变更事件
              $layerWarpper.find('input').on('input', function() {
                wantong.cms.pageAdd.setSaveNextButtonState(true);
              });
              //鼠标显示删除
              $layerWarpper.mouseover(function () {
                $(this).find('.delete-btn').css('visibility', 'visible');
              }).mouseout(function () {
                $(this).find('.delete-btn').css('visibility', 'hidden');
              });

              //单个删除
              $layerWarpper.find('.delete-btn').on('click', function () {
                var layerName = $(this).parent().attr('name');
                layer.confirm('确定要删除吗？删除后该点击区域下资源会被删除', {
                  btn: ['确定', '取消'] //按钮
                }, (index) => {
                  // wantong.cms.pageAdd.setSaveNextButtonState(true);
                  if ($(this).parent().hasClass('active-warpper')) {
                    //删除事件
                    var next = $(this).parent().prev() ? $(
                        this).parent().prev()
                        : $(this).parent().next();
                    _deleteIndex(layerName, true);
                    _activeLayerEdit(next ? next.attr('name') : $(
                        '.layer-inputs .layer-input-warpper').first().attr(
                        'name'));
                    $('#saveAndNextButton').removeAttr('disabled');
                  } else {
                    _deleteIndex(layerName, false);
                  }
                  layer.close(index);
                }, () => {
                });
              });
              //外部选择事件
              $layerWarpper.on('click', function () {
                _activeLayerEdit($(this).attr('name'));
              });

            } else {
              newIndex = false;
              layerName = position.name;
              $dom = $('.index-container [name="' + layerName + '"]');
              $layerWarpper = $(
                  '.layer-inputs .layer-input-warpper[name="' + layerName
                  + '"]');
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
              // $('.index-container').append($dom);
              if(_conf.viewMode == true){
                $layerWarpper.find(".layer-name").addClass("click_disabled");
                $layerWarpper.find(".delete-btn").remove();
              }
              $('.layer-inputs').append($layerWarpper);
            }
            _voiceDisplayControl(true);
            position.name = layerName;

            return layerName;
          },
          _deleteIndex = function (layerName, cleanVoice) {
            //删除序号信息
            $('.index-container [name="' + layerName + '"]').remove();
            //删除输入框
            $('.layer-inputs .layer-input-warpper[name="' + layerName
                + '"]').remove();
            //删除层中数据
            var index = layers.findIndex(item => item.name === layerName);
            delete_region(index);
            layers.splice(index, 1);

            //重新排序
            for (layerOrder = 0; layerOrder < layers.length; layerOrder++) {
              var l = layers[layerOrder];
              var lName = 'layer' + (layerOrder + 1);
              console.log(l.name, lName);
              if (l.name != lName) {
                //更新名字
                $dom = $('.index-container [name="' + l.name + '"]').attr(
                    'name',
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
          },
          _tagEditingData = function (voiceData) {
            //标记所有语音状态为编辑中
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
          };
      return {
        init: function (conf, lastName) {
          _init(conf, lastName);
        },
        getData: function () {
          return _getData();
        },
        via_load_submodules: function () {
          _via_load_submodules();
        },
        resize: function() {
          return _resize();
        },
        reloadAudioData: function(pageId) {
          return _reloadAudioData(pageId);
        },
        deleteIndex: function (name, clear) {
          return _deleteIndex(name, clear);
        },
        activeLayerEdit: function (name) {
          return _activeLayerEdit(name);
        },
        voiceDisplayControl: function(show) {
          return _voiceDisplayControl(show);
        }
      }
    }
)();
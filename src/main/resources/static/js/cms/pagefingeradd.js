wantong.cms.pageAdd = (function () {
  var
      _root = null,
      _error = null,
      _examine = null,
      _subManager = {
        voiceManager: null,
        fingerManager: null
      },
      _pageListPanel = null,
      _thisLayerIndex = 0,
      _partnerId = 0,
      _extraData = "",
      _moduleValue = 0,
      _saving = false, //是否正在保存
      _conf = {
        pageId: -1,
        bookExamine: false,
        ttsRoles: null,
        initData: {},
        examine: false,
        bookState: 0,
        fingerDatas: [],
        LOAD_PAGE_INFO: "cms/loadPageFingerInfo.do",
        SAVE_PAGE_FINGER_INFO: "cms/savePageFingerInfo.do",
        QUERY_FOR_TASK_STATUS: "cms/asyncSavePageFingerInfo.do",
        ADD_PAGE_URL: "cms/showAddPage.do",
        TEST_RECOGNIZE_URL: "cms/recognize.do",
        CHANGE_EXAMINE_URL: "cms/changePageExamine.do",
        CONVERT_CHECK_FINGER_AUDIO: "cms/existFingerAudio.do",
        CONVERT_CONVERT_FINGER_AUDIO: "cms/convertFingerAudio.do",
        CONVERT_QUERY_FOR_TASK_STATUS: "cms/queryConvertFingerAudioTask.do"
      },
      // _switchGroup = ["#voiceManager",
      //   ".right-container",
      //   ".voice-progress-bar",
      //   ".voice-progress-bar",
      //   "#display_area",
      //   ".frame-delete-btn",
      //   "#batchUploadFingerAudioBtn",
      //   "#convertResource"
      // ],
      _switchGroup = [
        "#tab_0_content",
        "#tab_1_content",
        "#tab_2_content",
        "#tab_3_content",
        "#tab_4_content",
        "#tab_5_content",
        "#display_area",
        ".frame-delete-btn",
        "#batchUploadFingerAudioBtn",
        "#convertResource",
        "#saveAndNextButton"
      ],
      _init = function (conf) {
        $.extend(_conf, conf);
        console.log("pageAddFinger");
        _root = $("#pageAdd");
        _error = _root.find("#error");
        _error.hide();
        _partnerId = conf.partnerId;
        _examine = conf.examine;
        //获得在那个模块
        _moduleValue = conf.moduleValue;
        _thisLayerIndex = layer.index;
        _subManager.pageList = wantong.cms.pageAdd.pageList;
        _subManager.fingerManager = wantong.cms.pageFingerAdd;
        _subManager.pageList.init({
          rootNode: _root.find("#pageListContainer"),
          examine: _conf.bookExamine,
          repoId: _conf.repoId
        });

        // _subManager.picManager = wantong.cms.pageAdd.picManager;
        _lister();
        _subManager.voiceManager = wantong.cms.pageAdd.voiceManager;
        _subManager.voiceManager.init({
          rootNode: _root.find("#voiceManager"),
          ttsRoles: _conf.ttsRoles,
          bookId: _conf.bookId,
          partnerId: _partnerId,
          finger: true
        });

        wantong.cms.batchUploadFingerAudio.init({
          bookId: _conf.bookId
        });

        _pageListPanel = _root.find("#pageList");
        _initPaginationPanel();
        _initPageListPanelToolbar();
        _initSaveAndNextButton();
        _initExamineBtn();
        _changeExtraDataSymbol();
        _initExtraDataSymbolBtn();
        _initExtraDataTextAreaChangeEvent();
        _initConvertBtn();
        if (conf.bookId) {
          _subManager.pageList.refresh(conf.bookId);
        }
        _bindViewEditorSwitcherEvent();
        _bindSwitchRightAndRightEvent();
      },
      /**
       * 查看扫描图业务, 绑定相关按钮点击事件
       * 切换按钮,屏蔽或取消屏蔽编辑区域的点击事件, 重新渲染点读框界面
       * @since Sprint7
       */
      _bindViewEditorSwitcherEvent = function () {
        $("#fingerHelpBtn2").popover();
        //查看正视图
        _root.find("#switchToViewButton").on('click', () => {
          _root.find("#switchToViewButton").hide();
          _root.find("#switchToEditorButton").show();
          _root.find("#fingerHelpBtn2").show();
          _root.find("#switchBtn").show();
          _conf.initData.viewMode = true;
          _subManager.fingerManager.init(_conf.initData);
          if (_conf.initData.userFingerDatasDTOS.length > 0) {
            if (_conf.initData.userFingerDatasDTOS.length == 1) {
              if (_conf.initData.userFingerDatasDTOS[0].scanType == 2) {
                _root.find("#rightBtn").addClass("active");
                _root.find("#leftBtn").removeClass("active");
              } else if (_conf.initData.userFingerDatasDTOS[0].scanType == 1) {
                _root.find("#leftBtn").addClass("active");
                _root.find("#rightBtn").removeClass("active");
              } else {
                _root.find("#switchBtn").hide();
              }
            } else {
              _root.find("#leftBtn").addClass("active");
              _root.find("#rightBtn").removeClass("active");
            }
          }
          _switchGroup.forEach(cssSelector =>
              _root.find(cssSelector).addClass("click_disabled")
          );
          _root.find("#batchUploadFingerAudioBtn span").css("background",
              "#e9f6fe");
          _root.find("#batchUploadFingerAudioBtn span").css("color", "#b1b2b3");
          _root.find("#convertResource div").css("color", "#b1b2b3");
          _root.find("#convertResource img").attr("src",
              "/static/images/right_no.png");
        });
        //编辑点读区域
        _root.find("#switchToEditorButton").on('click', () => {
          _root.find("#switchToEditorButton").hide();
          _root.find("#switchToViewButton").show();
          _root.find("#fingerHelpBtn2").hide();
          _root.find("#switchBtn").hide();
          _switchGroup.forEach(cssSelector =>
              _root.find(cssSelector).removeClass("click_disabled")
          );
          _root.find("#batchUploadFingerAudioBtn span").css("background",
              "#42bcef");
          _root.find("#batchUploadFingerAudioBtn span").css("color", "#FFFFFF");
          _root.find("#convertResource div").css("color", "#000");
          _root.find("#convertResource img").attr("src",
              "/static/images/right_arrow.png");
          _conf.initData.viewMode = false;
          _subManager.fingerManager.init(_conf.initData);
        });
      },
      /**
       * 用户点击左右视图切换按钮
       * @private
       */
      _bindSwitchRightAndRightEvent = function () {
        _root.find("#leftBtn").on("click", () => {
          _conf.initData.viewMode = true;
          _conf.initData.scanType = 1;
          if (_root.find("#leftBtn").hasClass("active")) {
            return;
          }
          _root.find("#rightBtn").removeClass("active");
          _root.find("#leftBtn").addClass("active");
          _subManager.fingerManager.init(_conf.initData);
        });

        _root.find("#rightBtn").on("click", () => {
          _conf.initData.viewMode = true;
          _conf.initData.scanType = 2;
          if (_root.find("#rightBtn").hasClass("active")) {
            return;
          }
          _root.find("#leftBtn").removeClass("active");
          _root.find("#rightBtn").addClass("active");
          _subManager.fingerManager.init(_conf.initData);
        });
      },
      _checkFingerAudioExist = function (bookId, recall, errorRecall) {
        $.ajax({
          type: "post",
          url: _conf.CONVERT_CHECK_FINGER_AUDIO,
          data: {"bookId": bookId},
          dataType: "json",
          success: function (data) {
            if (recall) {
              recall(data);
            }
          },
          error: function (data) {
            if (errorRecall) {
              errorRecall(data);
            }
          }
        });
      },
      _initConvertBtn = function () {
        $("#convertResource").on("click", (e) => {
          console.log('convert');
          _checkFingerAudioExist(_conf.bookId, function (data) {
            if (data.code == 0) {
              if (!data.data) {
                var index = layer.confirm(
                    '<div style="text-align: center">该书指读区域无音频，无法用于领读资源!</div>',
                    {
                      title: '提示',
                      btn: ['确定'] //按钮
                    }, function () {
                      layer.close(index);
                    });
              } else {
                _convertFingerTask();
              }
            } else {
              layer.msg(data.msg);
            }
          }, function (e) {
            layer.msg("网络异常");
          });

        });
      },
      _convertFingerTask = function () {
        var bookId = _conf.bookId;
        var taskId = '';
        var success = false;
        var index = layer.confirm(
            '<div style="text-align: left">将该本书的指读音频用于领读后，之前的领读资源将会被覆盖，确定要继续吗?</div>',
            {
              title: '提示',
              btn: ['确定', '取消'] //按钮
            }, function () {
              layer.close(index);
              //提交打包任务
              index = layer.msg('正在转为领读资源，请稍等...', {
                icon: 16,
                shade: [0.5, '#f5f5f5'],
                scrollbar: false,
                offset: 'auto',
                time: 1000000
              });
              $.ajax({
                type: "post",
                url: _conf.CONVERT_CONVERT_FINGER_AUDIO,
                data: {"bookId": bookId},
                async: false,
                dataType: "json",
                success: function (data) {
                  if (data.code == 0) {
                    taskId = data.data.taskId;
                    success = true;
                    return;
                  }
                  layer.close(index);
                  layer.msg("转换资源失败");
                },
                error: function (data) {
                  layer.close(index);
                  layer.msg("网络异常");
                }
              });

              //是否可以轮询任务状态
              if (success) {
                success = !success;
                var timeTask = setInterval(() => {
                  $.ajax({
                    url: _conf.CONVERT_QUERY_FOR_TASK_STATUS,
                    type: "POST",
                    async: false,
                    data: {"taskId": taskId},
                    dataType: "json",
                    success: function (data) {
                      if (data.code == 0) {
                        if (!data.data.finish) {
                          console.log('进度:' + data.data.progress + '%');
                          return;
                        }
                        layer.msg("转换完成");

                        success = true;
                      } else {
                        console.log(data);
                        layer.msg("打包数据出现异常");
                      }
                      success = true;
                    }
                  }).always(() => {
                    if (success) {
                      clearInterval(timeTask);
                      layer.close(index);
                    }
                  });
                }, 500);
              }
            });
      },
      _initExamineControl = function () {
        // var status = _conf.initData.trainTaskStatus;
        var examine = _conf.initData.examine;
        var bookExamine = _conf.bookExamine;
        var pageId = _conf.pageId;
        console.log("examine page" + examine + " bookExamine" + bookExamine);
        if (bookExamine && status != 0 && status != 3 && examine != 3) {
          //属于审核页
          _conf.examine = true;
          _root.find(".voice-test-progress").css("width", "65%");
          _root.find(".voice-test-progress").css("margin-left", "15px");
          _root.find("#examineBtn").css("display", "inline");
        } else {
          if (examine != 0) {
            _conf.examine = false;
          }
          _root.find("#examineBtn").css("display", "none");
          _root.find(".voice-test-progress").css("width", "80%");
          _root.find(".voice-test-progress").remove("margin-left");
        }
        if (_conf.examine) {
          var $tip = _root.find("#examineTip");
          if (examine == 1) {
            $tip.text("图片未能正常识别!");
          } else if (examine == 2) {
            $tip.text(_conf.initData.examineReason);
          } else {
            $tip.text("");
          }
        } else {
          var $tip = _root.find("#examineTip");
          $tip.text("");
        }

      },
      _initExamineBtn = function () {
        _root.find('#examineSuccessBtn').on('click', function () {
          //变更当前你书页状态为审核通过
          _setPicExamine(_conf.pageId, 3, '', function () {
            //刷新列表
            var bookId = $("#pageItem").attr("bookId");
            wantong.cms.pageAdd.pageList.refresh(bookId, function () {
              //刷新编辑页
              _loadPageData(_conf.pageId);
              _subManager.voiceManager.setCheckState(false);
            });
          });
        });

        _root.find('#examineFailBtn').on('click', function () {
          layer.prompt({
            formType: 2,
            title: '审核 - 不通过(填写原因)',
            yes: function (index, layero) {
              var value = layero.find(".layui-layer-input").val();
              console.log(value); //得到value
              if (value.length > 500) {
                layer.msg("原因备注不能大于500个字符");
                return;
              }
              _setPicExamine(_conf.pageId, 2, value, function () {
                //刷新列表
                var bookId = $("#pageItem").attr("bookId");
                wantong.cms.pageAdd.pageList.refresh(bookId, function () {
                  //刷新编辑页
                  _loadPageData(_conf.pageId);
                  _subManager.voiceManager.setCheckState(false);
                });
              });
              layer.close(index);
            }
          })
        });
      },
      _initExtraDataSymbolBtn = function () {
        _root.find("#extra-data .control-extra").off("click").on("click",
            function () {
              var thisJqObject = $(this);
              var symbolClass = thisJqObject.find("#symbol").attr("class");
              console.log('aaaaaaaaaaaa');
              _root.find("#extra-data #extraDataText").val(_extraData);
              if (symbolClass == "glyphicon glyphicon-minus") {
                thisJqObject.find("#symbol").attr("class",
                    "glyphicon glyphicon-plus");
                _root.find("#extra-data .panel-body").css("display", "none");
                thisJqObject.find("#symbol").css("margin-left", "1px");
              } else {
                thisJqObject.find("#symbol").attr("class",
                    "glyphicon glyphicon-minus");
                _root.find("#extra-data .panel-body").css("display", "inline");
                thisJqObject.find("#symbol").css("margin-left", "0px");
              }
            });
      },
      _initExtraDataTextAreaChangeEvent = function () {
        _root.find("#extra-data #extraDataText").on("input propertychange",
            function () {
              _extraData = $(this).val();
              $("#bookEdit").find("#saveAndNextButton").removeAttr("disabled");
              //$("#bookEdit").find("#saveAndNextButton").css('display', 'block');
              $("#bookEdit").find(".save-button-container").find(
                  "#startExamine").removeAttr("disabled");
              $("#bookEdit").find(".save-button-container").find(
                  "#startExamine").css('display', 'none');
            });
      },

      _changeExtraDataSymbol = function () {
        var symbol = _root.find("#extra-data .control-extra #symbol");
        if (symbol.attr("class") == "glyphicon glyphicon-minus") {
          symbol.attr("class", "glyphicon glyphicon-plus");
          _root.find("#extra-data .panel-body").css("display", "none");
          symbol.css("margin-left", "1px");
        }
      },
      _setPicExamine = function (pageId, examine, examineReason,
          successCallback) {
        //1 图片错误 2音频错误 3审核通过 4发布中 5发布失败
        $.ajax({
          url: _conf.CHANGE_EXAMINE_URL,
          type: 'POST',
          async: true,
          data: "pageId=" + pageId + "&examine=" + examine + "&examineReason="
              + examineReason,
          success: function (res) {
            if (res.code == 0) {
              if (successCallback) {
                successCallback();
              }
            } else {
              layer.msg('变更书页状态失败！' + res.msg, {time: 3000, offset: 'auto'});
            }
          }
        }); //end ajax

      },
      _loadPageData = function (pageId, lastFingerName) {
        $('#pageListContainer .page-thumbnail-container .active').removeClass(
            'active');
        $('#pageListContainer div[pageid="' + pageId
            + '"] .page-thumbnail-container img').addClass('active');
        console.log('chose');
        $.ajax({
          url: _conf.LOAD_PAGE_INFO,
          type: "GET",
          async: false,
          data: {
            pageId: pageId
          },
          success: function (data) {
            if (data.code == 0) {
              _renewAll();
              _conf.pageId = pageId;
              _root.find("#graphicRecognition").prop("checked",
                  data.data.recType == 0 ? false : true);
              _conf.initData = null;
              _conf.initData = data.data;
              /*
             * 重置viewMode为编辑模式
             * hasSscannogram=>有无扫描图,据此显示或隐藏'查看正视图'切换按钮
             * @since Sprint7
             */
              _root.find("#fingerHelpBtn2").hide();
              if (_conf.initData.userFingerDatasDTOS.length > 0) {
                _conf.initData.viewMode = false;
                _root.find("#switchToViewButton").show();
                _root.find("#switchToEditorButton").hide();
                _root.find("#fingerHelpBtn2").hide();
                _root.find("#switchBtn").hide();
                if (_conf.initData.userFingerDatasDTOS.length == 1) {
                  if (_conf.initData.userFingerDatasDTOS[0].scanType == 0) {
                    _root.find("#switchBtn").hide();
                    _conf.initData.scanType = 0;
                  } else {
                    if (_conf.initData.userFingerDatasDTOS[0].scanType == 1) {
                      _root.find("#leftBtn").removeClass("click_disabled")
                      _root.find("#rightBtn").addClass("click_disabled");
                      _conf.initData.scanType = 1;
                    } else {
                      _root.find("#leftBtn").addClass("click_disabled");
                      _root.find("#rightBtn").removeClass("click_disabled");
                      _conf.initData.scanType = 2;
                    }
                  }
                } else {
                  //  有两个书页 为左单页或者右单页
                  _root.find("#leftBtn").removeClass("click_disabled");
                  _root.find("#rightBtn").removeClass("click_disabled");
                  _conf.initData.scanType = 1;
                }
              } else {
                _conf.initData.viewMode = false;
                _root.find("#switchBtn").hide();
                _root.find("#switchToViewButton").hide();
                _root.find("#switchToEditorButton").hide();
                _root.find("#switchBtn").hide();
              }
              _switchGroup.forEach(
                  cssSelector => _root.find(cssSelector).removeClass(
                      "click_disabled"));
              _root.find("#batchUploadFingerAudioBtn span").css("background",
                  "#42bcef");
              _root.find("#batchUploadFingerAudioBtn span").css("color",
                  "#FFFFFF");
              _root.find("#convertResource div").css("color", "#000");
              _root.find("#convertResource img").attr("src",
                  "/static/images/right_arrow.png");
              _extraData = data.data.extraData;
              //里面有异步VIA操作 所以这里不传入回调了 不然会越来越深
              _subManager.fingerManager.init(data.data, lastFingerName);
              _changeExtraDataSymbol();
              _initPaginationPanel();
              _initExamineControl();
              _lister();
              _initSaveBtnDisable();
            } else {
              //do error
            }
          }
        });
      },
      _initSaveBtnDisable = function () {
        //禁用设置
        //区域名字
        $('.layer-inputs .layer').click(() => {
          $('#saveAndNextButton').removeAttr('disabled');
        });
        $('#voiceManager .voice-panel').click(function () {
          if ($(this).attr('id') !== 'tab_3_content') {
            $('#saveAndNextButton').removeAttr('disabled');
          }
        });
        //EXTRA DATA
        $('#extraDataText').bind('input propertychange', function () {
          $('#saveAndNextButton').removeAttr('disabled');
        });
        $('#saveAndNextButton').attr('disabled', 'disabled');
      },
      _initPaginationPanel = function () {
        var pageType = 0;
        var pagination = 0;
        var phyPage = 0;
        var phyState = 0;
        if (_conf.initData.pageType) {
          pageType = _conf.initData.pageType;
        }
        if (_conf.initData.pagination) {
          pagination = _conf.initData.pagination;
        }

        if (_conf.initData.physicalIndex) {
          phyPage = _conf.initData.physicalIndex;
        }

        if (_conf.initData.physicalState) {
          phyState = _conf.initData.physicalState;
        }
        if (pageType == 1) {
          pageType = '封面';
        } else if (pageType == 2) {
          pageType = '封里';
        } else if (pageType == 3) {
          pageType = '扉页';
        } else if (pageType == 4) {
          pageType = '目录';
        } else if (pageType == 5) {
          pageType = '正文';
        } else if (pageType == 6) {
          pageType = '辅文';
        } else if (pageType == 7) {
          pageType = '封底里';
        } else if (pageType == 8) {
          pageType = '封底';
        } else {
          pageType = '其它';
        }

        _root.find("#pageType").text(pageType);
        _root.find("#pagination").text(pagination);
        _root.find("#phyPage").text(phyPage);
        _root.find("#phyState").text(phyState);
      },
      _initSaveAndNextButton = function () {
        $("#saveAndNextButton").on("click", function () {
          if (_saving) {
            return;
          }
          _saving = true;
          $(this).blur();
          _subManager.voiceManager.voiceTestStop();

          var value = $(document.activeElement).val()
          if (isNaN(value)) {
            return;
          }
          // if(_conf.bookState == 0){
          //   _SavePageInCreateState();
          // }else if(_conf.bookState == 1){
          //   _SavePageInSamplingState();
          // }else {
          //   _SavePageInEditorState();
          // }
          _SavePage();
          //不用管异步 ，异步前会禁用保存按钮
          _saving = false;
        });
      },
      _checkLength = function (text, maxLength) {
        var l = 0;
        for (var i = 0; i < text.length; i++) {
          if (/[\u4e00-\u9fa5]/.test(text[i])) {
            l += 2;
          } else {
            l++;
          }
          if (l > maxLength) {
            return false;
          }
        }

        return true;
      },
      _SavePage = function () {
        //有编辑书页的权限 包括语音、背景音乐、音效的编辑、书页类型及页码的编辑
        var d = _subManager.fingerManager.getData();
        var fingerDatas = d.layers;
        var lastFingerName = d.name;
        for (var i = 0; i < fingerDatas.length; i++) {
          var voiceData = fingerDatas[i].voice;
          var extraData = fingerDatas[i].extraData;
          if (!_checkLength(fingerDatas[i].nickname, 30)) {
            layer.msg("区域名不能超过30个字符！");
            return;
          }
          if (!fingerDatas[i].nickname || fingerDatas[i].nickname.length == 0) {
            layer.msg("有区域名字为空，请检查！");
            return;
          }
          if (voiceData == "1") {
            layer.msg("数据有误，无法保存,请检查语音、背景音乐和音效！");
            return;
          }
          // if(voiceData == "4"){
          //   layer.msg("请添加语音");
          //   console.log("缺失语音4:" + i, fingerDatas[i]);
          //   return;
          // }
          // if (voiceData == "2" && _partnerId==1) {
          //   layer.msg("请添加语音");
          //   console.log("缺失语音2:" + i, fingerDatas[i]);
          //   return;
          // }
          if (voiceData == "2") {
            fingerDatas[i].voice = {
              voice: [],
              bgMusic: [],
              effectSound: []
            };
          }
          if (voiceData == "3") {
            layer.msg("请重新添加语音间隔！");
            return;
          }
          if (voiceData == "4") {
            layer.msg("请添加语音");
            return;
          }
          if (!voiceData) {
            console.log('?????????????', voiceData);
            //获取voice data出错，什么都不做
            layer.msg("语音过长");
            return;
          }
          // if(_partnerId==1) {
          //   if (voiceData.voice.length == 0
          //       && voiceData.bgMusic.length == 0
          //       && voiceData.effectSound.length == 0) {
          //     layer.msg("请保证所有点读区域均有可用语音文件");
          //     return;
          //   }
          // }
          if (!isNaN(voiceData)) {
            voiceData = null;
          }
          // if((voiceData == null || (voiceData.voice.length == 0
          //     && voiceData.bgMusic.length == 0
          //     && voiceData.effectSound.length == 0)) && extraData == ""){
          //   layer.msg("请添加书页资源");
          //   return;
          // }
        }

        var data = {
          id: _conf.pageId,
          bookId: _conf.bookId,
          trainTaskId: _conf.taskId,
          uploadFingerDatas: fingerDatas,
          lastFingerName: lastFingerName
        }
        //var allData = new Array();
        //allData.push(data);
        _savePageInfo(data);
      },
      _savePageInfo = function (pagedata) {
        var saveBtn = _root.find("#saveAndNextButton");
        saveBtn.attr('disabled', true);
        var btnTxt = saveBtn.html();
        var btnWidth = saveBtn.width();
        saveBtn.width(btnWidth).html(
            "<img style='width:20px; height:20px' src='" + GlobalVar.contextPath
            + "/static/images/loading.gif'> &nbsp;保存中");
        var msg = "";
        var taskId = "";
        var success = false;
        console.log("subData", pagedata);
        var pageId = "";
        //先保存
        $.ajax({
          url: _conf.SAVE_PAGE_FINGER_INFO,
          type: "POST",
          async: false,
          contentType: "application/json",
          data: JSON.stringify(pagedata),
          dataType: 'json',
          success: function (data) {
            if (data.code == 0) {
              taskId = data.data.taskId;
              pageId = data.data.pageId;
              success = true;
              return;
            }
            layer.msg("保存失败");
          }
        }).always(function () {
          if (!success) {
            saveBtn.html(btnTxt).attr('disabled', false);
          }
        });
        if (success) {
          success = !success;
          var finish = false;
          var timeTask = setInterval(function () {
            $.ajax({
              url: _conf.QUERY_FOR_TASK_STATUS,
              type: "POST",
              async: false,
              data: "taskId=" + taskId,
              success: function (data) {
                if (data.code == 0) {
                  if (!data.data.finish) {
                    saveBtn.width(btnWidth).html(
                        "<img style='width:20px; height:20px' src='"
                        + GlobalVar.contextPath
                        + "/static/images/loading.gif'> &nbsp;保存中  "
                        + data.data.progress + "%");
                    return;
                  }

                  success = true;
                  finish = true;
                  if (_conf.examine) {
                    //属于审核 变更审核状态为0
                    _setPicExamine(pageId, 0, '', function () {
                      //刷新列表
                      _subManager.pageList.refresh(_conf.bookId, function () {
                        //刷新编辑页
                        //_loadPageData(_conf.pageId);
                        layer.msg("保存成功", {time: 3000});
                        _loadPageData(pageId, pagedata.lastFingerName);
                        // _setSaveNextButtonState(false);
                      });
                    });
                    $("#examineBtn").css("display", "none");
                  } else {
                    // _subManager.pageList.refresh(_conf.bookId, null,
                    //     function () {
                    _loadPageData(pageId, pagedata.lastFingerName);

                    // _setSaveNextButtonState(false);
                    // });
                    layer.msg("保存成功");
                    return;
                    //暂时不自动切换下一页 直接返回成功
                    //判断有没有添加书页的权限
                    if (_authorityManagement.addPage) {
                      layer.confirm('是否继续添加新的一页？',
                          {
                            icon: 3,
                            title: "保存成功" + msg,
                            cancel: function (index) {
                              layer.close(index);
                            }
                          },
                          function (index) {
                            _renewAll();
                            wantong.cms.pageAdd.pageList.renderEditing();
                            layer.close(index);
                          },
                          function (index) {
                            //展开页
                            var btn = _root.find("#togglePageListPanelBtn");
                            var span = btn.find("span");
                            var addNewbtn = _root.find("#addNewPageBtn");
                            if (span.hasClass("glyphicon-chevron-right")) {
                              _pageListPanel.animate({
                                width: '200px'
                              }, 200, function () {
                                span.removeClass("glyphicon-chevron-right");
                                span.addClass("glyphicon-chevron-left");
                                addNewbtn.css('display', 'block');
                                //滚动到顶部
                                _root.parent().animate({scrollTop: 0}, 500);
                              });
                              _root.find("#bookEdit").animate({
                                width: '80%',
                              }, 20);
                            } else {
                              _root.parent().animate({scrollTop: 0}, 500);
                            }
                            layer.close(index);

                            _subManager.pageList.bookInfoCheck(); //如果用户没有继续添加新页面，触发书本数据完整性检测
                          }
                      );
                    } else {
                      layer.msg("保存成功");
                    }
                  }

                } else if (data.code == 10057 || data.code == 20014) {
                  layer.msg("有书本正在训练，暂不能删除书页或更换图片！");
                } else if (data.code == 20058) {
                  layer.msg("物理页超出范围！(0至最大物理页+1)");
                } else if (data.code == 20061) {
                  layer.msg("物理页状态已经存在");
                } else {
                  layer.msg("保存绘本书页数据失败");
                }

                success = data.code == 0;
                finish = true;
              },
              error: function () {
                layer.msg("服务无响应");
                success = false;
                finish = true;
              }
            }).always(function () {
              if (finish) {
                saveBtn.html(btnTxt);
                if (!success) {
                  saveBtn.attr('disabled', false);
                }
                clearInterval(timeTask);
              }
            });
          }, 500);
        }

      },
      _calcNextPhyPage = function () {
        //直接返回0 让后台去修正这个物理页
        return 0;
      },
      _renewAll = function () {
        _root.find("#pageType").val(0);
        _root.find("#pagination").val(0);
        _root.find("#phyPage").val(_calcNextPhyPage());
        _root.find("#graphicRecognition").prop("checked", false);
        // _subManager.picManager.renewAll();
        _subManager.voiceManager.renewAll();
        _conf.pageId = 0;
        _extraData = "";
        _changeExtraDataSymbol();
        wantong.cms.pageAdd.pageList.clearEditing();
      },
      _resizeCalc = function (hideLeft) {
        //获取窗口基本数据
        var fullWidth = $('#pageAdd').innerWidth();
        var fullHeight = $('#pageAdd').innerHeight();
        var pageListWidth = hideLeft ? 0 : $('#pageListContainer').outerWidth();
        var innerHeight = fullHeight - 11 - 40;
        var rightWidth = fullWidth - pageListWidth - 30;
        console.log('frame width', fullWidth, pageListWidth, rightWidth);
        //右侧编辑区宽度
        $('#bookEdit').width(rightWidth + 'px');
        //判断资源转换按钮是否存在
        innerHeight = $('#convertResource').length > 0 ?
            innerHeight - $('#convertResource').outerHeight() + 10
            : innerHeight;
        $('#pageListContainer').height(innerHeight);

        //$('.right-container').height(innerHeight - 63);
        //标题
        $('.page-container').width(rightWidth + 'px');
        wantong.cms.pageFingerAdd.resize();
        //VIA_SCALE
        _auto_scale();
        //初始化高度
        var height = $('#region_canvas').height();
        $('.layer-inputs').css('height', (height - 70) + 'px');
      },
      _initPageListPanelToolbar = function () {
        var leftBtn = $('.frame-resize-btn .resize-left img');
        var rightBtn = $('.frame-resize-btn .resize-right img');
        var leftMenu = $('.navbar-static-top');
        var rightMenu = $('.right-container');
        leftBtn.click(() => {
          if (leftMenu.css('display') == 'none') {
            //弹出列表
            leftMenu.css('display', 'block');
            leftBtn.attr('src', 'static/images/finger/l_open.png');
            _resizeCalc(false);
          } else {
            leftMenu.css('display', 'none');
            leftBtn.attr('src', 'static/images/finger/l_close.png');
            _resizeCalc(true);
          }

        });
        rightBtn.click(() => {
          var hideLeft = leftMenu.css('display') == 'none';
          if (rightMenu.css('display') == 'none') {
            //弹出列表
            rightMenu.css('display', 'inline-block');
            rightBtn.attr('src', 'static/images/finger/r_open.png');
          } else {
            rightMenu.css('display', 'none');
            rightBtn.attr('src', 'static/images/finger/r_close.png');
          }
          _resizeCalc(hideLeft);
        });

        //删除事件
        //全部删除
        $('.frame-delete-btn .delete-all-region').on('click', function () {
          console.log('全部删除 active');
          var doms = $('.layer-input-warpper');
          if (doms.size() <= 0) {
            layer.msg('当前页暂无点读热区');
            return;
          }
          layer.confirm('您确定要清空当前页的全部点读框吗？清空点读框后，点读区域下的资源也会被清空', {
            btn: ['确定', '取消'], //按钮
            title: "提示"
          }, (index) => {
            // wantong.cms.pageAdd.setSaveNextButtonState(true);
            doms.each(function () {
              var currentDom = $(this);
              var layerName = currentDom.attr('name');
              if (currentDom.hasClass('active-warpper')) {
                //删除事件
                wantong.cms.pageFingerAdd.deleteIndex(layerName, true);
              } else {
                wantong.cms.pageFingerAdd.deleteIndex(layerName, false);
              }

              wantong.cms.pageFingerAdd.voiceDisplayControl(false);
              $('#saveAndNextButton').removeAttr('disabled');
            });
            layer.close(index);
          }, () => {
          });
        });

        //var btn = _root.find("#togglePageListPanelBtn");
        //var _bookEdit = _root.find("#bookEdit");
        // btn.click(function () {
        //   var span = btn.find("span");
        //   var addNewBtn = $('#addNewPageBtn');
        //   var targetHeight = 0;
        //   if (span.hasClass("glyphicon-chevron-left")) {
        //     _pageListPanel.animate({
        //       width: '0px',
        //     }, 500, function () {
        //       addNewBtn.css('display', 'none');
        //       span.removeClass("glyphicon-chevron-left");
        //       span.addClass("glyphicon-chevron-right");
        //     });
        //     _bookEdit.animate({
        //       width: '97%',
        //     }, 700, function () {
        //     });
        //   } else {
        //     _pageListPanel.animate({
        //       width: '200px',
        //     }, 500, function () {
        //       span.removeClass("glyphicon-chevron-right");
        //       span.addClass("glyphicon-chevron-left");
        //     });
        //     _bookEdit.animate({
        //       width: '85%',
        //     }, 70, function () {
        //     });
        //   }
        // });
      },
      _lister = function () {

        var all = $('#bookEdit');
        var input1 = all.find("#pagination");
        var selet = all.find('#pageType');
        var select = all.find("#phyState");
        // var picManager = all.find("#picManager");
        // var uploadBtn1 = picManager.find("#image1").find("#uploadButton");
        // var uploadBtn2 = picManager.find("#image2").find("#uploadButton");
        // var uploadBtn3 = picManager.find("#image3").find("#uploadButton");
        // var uploadBtn4 = picManager.find("#image4").find("#uploadButton");
        var click2 = all.find("#tab_0_content").find("#addNewVoiceBtn");
        var click3 = all.find("#tab_1_content").find("#addNewVoiceBtn");
        var click4 = all.find("#tab_2_content").find("#addNewVoiceBtn");

        _root.find("#graphicRecognition").change(function () {
          _setSaveNextButtonState(true);
        });

        input1.on('click', function () {
          _setSaveNextButtonState(true);
          console.log("1111");
          if (_root.find("#pagination").val() == 0) {
            _root.find("#pagination").val("");
          }
          _root.find("#examineSuccessBtn").attr("disabled", "true");
          _root.find("#examineFailBtn").attr("disabled", "true");
        });
        input1.on('onfocus', function () {
          _setSaveNextButtonState(true);
          _root.find("#examineSuccessBtn").attr("disabled", "true");
          _root.find("#examineFailBtn").attr("disabled", "true");
        });
        selet.on('click', function () {
          _setSaveNextButtonState(true);
          _root.find("#examineSuccessBtn").attr("disabled", "true");
          _root.find("#examineFailBtn").attr("disabled", "true");
        });
        select.on('click', function () {
          _setSaveNextButtonState(true);
          _root.find("#examineSuccessBtn").attr("disabled", "true");
          _root.find("#examineFailBtn").attr("disabled", "true");
        });
        click2.on('click', function () {
          _setSaveNextButtonState(true);
          _root.find("#examineSuccessBtn").attr("disabled", "true");
          _root.find("#examineFailBtn").attr("disabled", "true");
        });
        click3.on('click', function () {
          _setSaveNextButtonState(true);
          _root.find("#examineSuccessBtn").attr("disabled", "true");
          _root.find("#examineFailBtn").attr("disabled", "true");
        });
        click4.on('click', function () {
          _setSaveNextButtonState(true);
          _root.find("#examineSuccessBtn").attr("disabled", "true");
          _root.find("#examineFailBtn").attr("disabled", "true");
        });
        _listerUndate();

      },
      _listerUndate = function () {
        var v1 = $('#bookEdit').find("#tab_0_content").find(".item-valid");
        var v2 = $('#bookEdit').find("#tab_1_content").find(".item-valid");
        var v3 = $('#bookEdit').find("#tab_2_content").find(".item-valid");
        for (var i = 0; i < v1.length; i++) {
          $(v1[i]).find("#deleteButton").on('click', function () {
            _setSaveNextButtonState(true);
            _root.find("#examineSuccessBtn").attr("disabled", "true");
            _root.find("#examineFailBtn").attr("disabled", "true");
          });
          $(v1[i]).find("#editBtn").on('click', function () {
            _setSaveNextButtonState(true);
            _root.find("#examineSuccessBtn").attr("disabled", "true");
            _root.find("#examineFailBtn").attr("disabled", "true");
          });
          $(v1[i]).find("#intervalTime").bind('input porpertychange',
              function () {
                _setSaveNextButtonState(true);
                _root.find("#examineSuccessBtn").attr("disabled", "true");
                _root.find("#examineFailBtn").attr("disabled", "true");
              });
        }
        ;
        for (var i = 0; i < v2.length; i++) {
          $(v2[i]).find("#deleteButton").on('click', function () {
            _setSaveNextButtonState(true);
            _root.find("#examineSuccessBtn").attr("disabled", "true");
            _root.find("#examineFailBtn").attr("disabled", "true");
          });
          $(v2[i]).find("#editBtn").on('click', function () {
            _setSaveNextButtonState(true);
            _root.find("#examineSuccessBtn").attr("disabled", "true");
            _root.find("#examineFailBtn").attr("disabled", "true");
          });
          $(v2[i]).find("#startAt").bind('input porpertychange', function () {
            _setSaveNextButtonState(true);
            _root.find("#examineSuccessBtn").attr("disabled", "true");
            _root.find("#examineFailBtn").attr("disabled", "true");
          });
        }
        ;
        for (var i = 0; i < v3.length; i++) {
          $(v3[i]).find("#deleteButton").on('click', function () {
            _setSaveNextButtonState(true);
            _root.find("#examineSuccessBtn").attr("disabled", "true");
            _root.find("#examineFailBtn").attr("disabled", "true");
          });
          $(v3[i]).find("#editBtn").on('click', function () {
            _setSaveNextButtonState(true);
            _root.find("#examineSuccessBtn").attr("disabled", "true");
            _root.find("#examineFailBtn").attr("disabled", "true");
          });
          $(v3[i]).find("#startAt").bind('input porpertychange', function () {
            _setSaveNextButtonState(true);
            _root.find("#examineSuccessBtn").attr("disabled", "true");
            _root.find("#examineFailBtn").attr("disabled", "true");
          });
        }
      },
      _destory = function () {
        _subManager.pageList.bookInfoCheck(_conf.bookExamine);
        _subManager.voiceManager.stopAllAudio();
        _subManager.voiceManager.voiceTestStop();
      },
      _checkExamineBookStatus = function () {
        _subManager.pageList.checkExamineBook(_conf.bookId, _destory());
      },
      _setSaveNextButtonState = function (state) {
        //state为false 为不可点击   true可点击
        if (state) {
          _root.find("#saveAndNextButton").removeAttr("disabled");
        } else {
          _root.find("#saveAndNextButton").attr("disabled", "disabled");
        }
      },
      _setExtraData = function (extraData) {
        console.log('_setExtraData', extraData);
        _extraData = extraData;
        return _root.find("#extra-data #extraDataText").val(extraData);
      },
      _getExtraData = function () {
        return _root.find("#extra-data #extraDataText").val();
      },
      _pageLimit = function (obj) {
        //过滤非数字字符
        obj.value = obj.value.replace(/\D/g, '')
        //过滤空数据
        if (obj.value == null || obj.value == "") {
          $(this).val('');
        } else {
          //过滤数字前面的0
          var value = parseInt(obj.value);
          //过滤1-100之外的数据
          if (value < 1) {
            value = 1;
          }
          if (value > 500) {
            value = 500;
          }
          obj.value = value;
          _setSaveNextButtonState(true);
        }
      },
      _refresh = function () {
        _subManager.pageList.refresh(_conf.bookId, function () {
          _loadPageData(_conf.pageId);
        });
      };

  return {
    init: function (conf, lastName) {
      _init(conf, lastName);
    },
    refresh: function () {
      _refresh();
    },
    loadPageData: function (pageId) {
      _loadPageData(pageId);
    },
    linsterUndate: function () {
      _listerUndate();
    },
    renewAll: function () {
      _renewAll();
    },
    getEditingPageId: function () {
      return _conf.pageId;
    },
    destory: function () {
      _destory();
    },
    pageLimit: function (obj) {
      _pageLimit(obj);
    },
    setSaveNextButtonState: function (state) {
      _setSaveNextButtonState(state);
    },
    checkExamineBookStatus: function () {
      _checkExamineBookStatus();
    },
    initExtraDataSymbolBtn: function () {
      _initExtraDataSymbolBtn();
    },
    setExtraData: function (extraData) {
      _setExtraData(extraData);
    },
    getExtraData: function () {
      return _getExtraData();
    },
    resizeCalc: function (hideLeft) {
      return _resizeCalc(hideLeft);
    },
    flag: true
  }
})();



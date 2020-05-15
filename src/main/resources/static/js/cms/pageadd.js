wantong.cms.pageAdd = (function () {
  var
      _root = null,
      _error = null,
      _examine = null,
      _subManager = {
        voiceManager: null
      },
      _pageListPanel = null,
      _thisLayerIndex = 0,
      _partnerId=0,
      _extraData="",
      _moduleValue = 0,
      _isClickSavePageBtn = false,
      _isClickExaSucBtn = false,
      _isClickExaFailBtn = false,
      _conf = {
        pageId: -1,
        bookExamine: false,
        ttsRoles: null,
        initData: {},
        examine: false,
        bookState:0,
        LOAD_PAGE_INFO: "cms/loadPageInfo.do",
        SAVE_PAGE_INFO: "cms/savePageInfo.do",
        ADD_PAGE_URL: "cms/showAddPage.do",
        TEST_RECOGNIZE_URL: "cms/recognize.do",
        CHANGE_EXAMINE_URL: "cms/changePageExamine.do",
        URL_PACK_UP_RESOURCE: "cms/packUpResource.do",
        URL_CHECK_PACK_UP_RESOURCE: "cms/checkPackUpResource.do"
      },
      _init = function (conf) {
        $.extend(_conf, conf);
        console.log("pageAdd");
        _root = $("#pageAdd");
        _error = _root.find("#error");
        _error.hide();
        _partnerId=conf.partnerId;
        _examine = conf.examine;
        //获得在那个模块
        _moduleValue = conf.moduleValue;
        _thisLayerIndex = layer.index;
        _subManager.pageList = wantong.cms.pageAdd.pageList;
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
          partnerId: _conf.partnerId,
          finger:false
        });

        _pageListPanel = _root.find("#pageList");
        // _root.find("#bookEdit").on('mousewheel', function () {
        //   return false;
        // });
        _initPaginationPanel();
        _initPageListPanelToolbar();
        _initSaveAndNextButton();
        _initExamineBtn();
        _changeExtraDataSymbol();
        _initExtraDataSymbolBtn();
        _initResourceDownloadBtn();
        _initExtraDataTextAreaChangeEvent();
        if (conf.bookId) {
          _subManager.pageList.refresh(conf.bookId);
        }

      },
      _initResourceDownloadBtn = function() {
        $("#downloadResource").on("click", (e)=>{
          var bookId = _conf.bookId;
          var taskId = '';
          var success = false;
          var index = layer.confirm('<div style="text-align: center">您确定要批量下载整本书的录音吗?</div>', {
            title:'提示',
            btn: ['确定', '取消'] //按钮
          }, function(){
            layer.close(index);
            //提交打包任务
            index = layer.msg('文件打包中...', {icon: 16,shade: [0.5, '#f5f5f5'],scrollbar: false,offset: 'auto', time: 1000000});
            $.ajax({
              type: "post",
              url: _conf.URL_PACK_UP_RESOURCE,
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
                layer.msg("打包资源失败");
              },
              error: function (data) {
                layer.close(index);
                layer.msg("网络异常");
              }
            });

            //是否可以轮询任务状态
            if (success) {
              success = !success;
              var timeTask = setInterval(()=> {
                $.ajax({
                  url: _conf.URL_CHECK_PACK_UP_RESOURCE,
                  type: "POST",
                  async: false,
                  data: {"taskId": taskId},
                  dataType: "json",
                  success: function (data) {
                    if (data.code == 0) {
                      if (!data.data.finish) {
                        console.log('打包进度:' + data.data.progress + '%');
                        return;
                      }
                      window.open(data.data.extra);

                      success = true;
                    } else {
                      console.log(data);
                      layer.msg("打包数据出现异常");
                    }
                    success = true;
                  }
                }).always(()=>{
                  if (success) {
                    clearInterval(timeTask);
                    layer.close(index);
                  }
                });
              }, 500);
            }
          });
        });
      },
      _initExamineControl = function () {
        // var status = _conf.initData.trainTaskStatus;
        var examine = _conf.initData.examine;
        var bookExamine = _conf.bookExamine;
        var pageId = _conf.pageId;
        console.log("examine page" + examine + " bookExamine" + bookExamine);
        if (bookExamine && status == 7  && examine != 3) {
          //属于审核页
          _conf.examine = true;
          _root.find(".voice-test-progress").css("width", "65%");
          _root.find(".voice-test-progress").css("margin-left", "15px");
          _root.find("#examineBtn").css("display", "inline");
        } else {
          if (examine != 0) {
            _conf.examine = false;
          }
          // _root.find(".voice-test-progress").css("width", "80%");
          // _root.find(".voice-test-progress").remove("margin-left");
        }
        if (_conf.examine) {
          var $tip = _root.find("#examineTip");
          if (examine == 2) {
            $tip.text(_conf.initData.examineReason);
          } else {
            $tip.text("");
          }
        } else {
          var $tip = _root.find("#examineTip");
          $tip.text("");
        }

        if(bookExamine == "true"){
          _root.find(".voice-test-progress").css("width", "65%");
          _root.find(".voice-test-progress").css("margin-left", "15px");
          _root.find("#examineBtn").css("display", "inline");
        }

      },
      _initExamineBtn = function () {
        _root.find('#examineSuccessBtn').on('click', function () {
          //变更当前你书页状态为审核通过

          $(this).blur();
          if(!_isClickExaSucBtn) {
            _isClickExaSucBtn = false;
            _setPicExamine(_conf.pageId, 3, '', function () {
              //刷新列表
              var bookId = $("#pageItem").attr("bookId");
              wantong.cms.pageAdd.pageList.refresh(bookId, function () {
                //刷新编辑页
                _loadPageData(_conf.pageId);
              });
              if(_isClickExaSucBtn){
                _isClickExaSucBtn = false;
              }
            });
          }
        });

        _root.find('#examineFailBtn').on('click', function () {
          $(this).blur();

          if(!_isClickExaFailBtn) {
            _isClickExaFailBtn = true;
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
              },
              end:function () {
                if(_isClickExaFailBtn){
                  _isClickExaFailBtn = false;
                }
              }
            })
          }
        });
      },
      _initExtraDataSymbolBtn=function(){
         _root.find("#extra-data .control-extra").on("click",function () {
            var thisJqObject=$(this);
            var symbolClass=thisJqObject.find("#symbol").attr("class");
            if(symbolClass=="glyphicon glyphicon-minus"){
              thisJqObject.find("#symbol").attr("class","glyphicon glyphicon-plus");
              _root.find("#extra-data .panel-body").css("display","none");
              thisJqObject.find("#symbol").css("margin-left","1px");
            }else {

              _root.find("#extra-data #extraDataText").val(_extraData);

              thisJqObject.find("#symbol").attr("class","glyphicon glyphicon-minus");
              _root.find("#extra-data .panel-body").css("display","inline");
              thisJqObject.find("#symbol").css("margin-left","0px");
            }
         });
      },
      _initExtraDataTextAreaChangeEvent=function(){
        _root.find("#extra-data #extraDataText").on("input propertychange",function () {
           _extraData=$(this).val();
          $("#bookEdit").find(".save-button-container").find("#saveAndNextButton").removeAttr("disabled");
          $("#bookEdit").find(".save-button-container").find("#saveAndNextButton").css('display', 'inline');
          $("#bookEdit").find(".save-button-container").find("#startExamine").removeAttr("disabled");
          $("#bookEdit").find(".save-button-container").find("#startExamine").css('display', 'none');
        });
      },

      _changeExtraDataSymbol=function(){
           var symbol= _root.find("#extra-data .control-extra #symbol");
           if(symbol.attr("class")== "glyphicon glyphicon-minus"){
             symbol.attr("class","glyphicon glyphicon-plus");
             _root.find("#extra-data .panel-body").css("display","none");
             symbol.css("margin-left","1px");
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
      _loadPageData = function (pageId) {
        $('#pageListContainer .page-thumbnail-container .active').removeClass('active');
        $('#pageListContainer .page-thumbnail-container .mouseHover').removeClass('mouseHover');
        $('#pageListContainer div[pageid="' + pageId+ '"] .page-thumbnail-container img').addClass('active');
        console.log('chose');
        $.ajax({
          url: _conf.LOAD_PAGE_INFO,
          type: "GET",
          async: false,
          contentType: "application/json",
          data: {
            pageId: pageId,
            repoId: _conf.repoId
          },
          dataType: 'json',
          success: function (data) {
            console.log("load");
            if (data.code == 0) {
               _renewAll();
              _conf.pageId = pageId;
              _root.find("#graphicRecognition").prop("checked",
                  data.data.recType == 0 ? false : true);
              _conf.initData = null;
              _conf.initData = data.data;
              _extraData=data.data.extraData;

               _subManager.voiceManager.loadData(data.data);
               _root.find('#videoText').val(data.data.videoText);
              _changeExtraDataSymbol();
              _initPaginationPanel();
              _initExamineControl();
              _lister();
            } else {
              //do error
            }
          }
        });
      },
      _initPaginationPanel = function () {
        var pageType = 0;
        var pagination = 0;
        var phyPage = 0;
        var phyState = 0;
        var examineReason ="";
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

        if(_conf.initData.examineReason){
          examineReason = _conf.initData.examineReason;
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
        _root.find("#examineTip").text(examineReason);
      },
      _initSaveAndNextButton = function () {
        $("#saveAndNextButton").on("click", function () {
          $(this).blur();
          _subManager.voiceManager.voiceTestStop();

          var value = $(document.activeElement).val()
          if (isNaN(value)) {
              return;
            }
            if(!_isClickSavePageBtn) {
              _isClickSavePageBtn = true;
              _SavePage();
            }
        });
      },
      _SavePage = function(){
          let isAllow = JSON.parse(_root.find("#allowNull").attr("isAllow"));
          //有编辑书页的权限 包括语音、背景音乐、音效的编辑、书页类型及页码的编辑
          var voiceData = _subManager.voiceManager.getData();
          var videoText = _root.find('#videoText').val();

          if (voiceData == "1") {
            layer.msg("数据有误，无法保存,请检查语音、背景音乐和音效！");
            _isClickSavePageBtn = false;
            return;
          }
          if (voiceData == "3") {
            layer.msg("请重新添加语音间隔！");
            _isClickSavePageBtn = false;
            return;
          }
          if(voiceData == "4"){
            layer.msg("请添加语音");
            _isClickSavePageBtn = false;
            return;
          }
          if (!voiceData) {
            //获取voice data出错，什么都不做
            layer.msg("语音过长");
            _isClickSavePageBtn = false;
            return;
          }
          if(!isNaN(voiceData)){
            voiceData = null;
          }
          if(!isAllow) {
            if (voiceData == null && _extraData == "") {
              layer.msg("请添加书页资源");
              _isClickSavePageBtn = false;
              return;
            }
          }
          var data = {
            id: _conf.pageId,
            bookId: _conf.bookId,
            trainTaskId: _conf.taskId,
            voice: voiceData,
            extraData:_extraData,
            videoText: videoText
          }
          // var allData = new Array();
          // allData.push(data);
          _savePageInfo(data);
      },
      _savePageInfo = function (pagedata) {
        var msg = "";
        var saveBtn = _root.find("#saveAndNextButton");
        var btnWidth = saveBtn.width();
        var btnTxt = saveBtn.html();
        saveBtn.html(
            "<img style='width:20px; height:20px' src='" + GlobalVar.contextPath
            + "/static/images/loading.gif'> &nbsp;保存中")
        .attr('disabled', true).width(btnWidth);
        $.ajax({
          url: _conf.SAVE_PAGE_INFO,
          type: "POST",
          async: true,
          contentType: "application/json",
          data: JSON.stringify(pagedata),
          dataType: 'json',
          success: function (data) {
            if (data.code == 0) {
                _subManager.pageList.refresh(_conf.bookId, null, function () {
                  _loadPageData(data.data.pageId);

                });
                layer.msg("保存成功");
            } else if (data.code == 10057 || data.code == 20014) {
              layer.msg("有书本正在训练，暂不能删除书页或更换图片！");
            } else if (data.code == 20058) {
              layer.msg("物理页超出范围！(0至最大物理页+1)");
            } else if (data.code == 20061) {
              layer.msg("物理页状态已经存在");
            }else {
              layer.msg("保存绘本书页数据失败");
            }
          },
          error: function () {
            layer.msg("服务无响应");
          }
        }).always(function () {
          saveBtn.html(btnTxt).attr('disabled', false);
          setTimeout(function () {
            if(_isClickSavePageBtn){
              _isClickSavePageBtn=false;
            }
          },2000);
        });
      },

      _calcNextPhyPage = function() {
        //直接返回0 让后台去修正这个物理页
        return 0;
      },
      _renewAll = function () {
        _root.find("#pageType").text(0);
        _root.find("#pagination").text(0);
        _root.find("#phyPage").text(_calcNextPhyPage());
        _root.find("#graphicRecognition").prop("checked", false);
        // _subManager.picManager.renewAll();
        _subManager.voiceManager.renewAll();
        _conf.pageId = 0;
        _extraData="";
        _changeExtraDataSymbol();
        wantong.cms.pageAdd.pageList.clearEditing();
      },
      _initPageListPanelToolbar = function () {
        var btn = _root.find("#togglePageListPanelBtn");
        var _bookEdit = _root.find("#bookEdit");
        btn.click(function () {
          var span = btn.find("span");
          var addNewBtn = $('#addNewPageBtn');
          var targetHeight = 0;
          if (span.hasClass("glyphicon-chevron-left")) {
            _pageListPanel.animate({
              width: '0px',
            }, 500, function () {
              addNewBtn.css('display', 'none');
              span.removeClass("glyphicon-chevron-left");
              span.addClass("glyphicon-chevron-right");
            });
            _bookEdit.animate({
              width: '97%',
            }, 700, function () {
            });
          } else {
            _pageListPanel.animate({
              width: '200px',
            }, 500, function () {
              span.removeClass("glyphicon-chevron-right");
              span.addClass("glyphicon-chevron-left");
            });
            _bookEdit.animate({
              width: '80%',
            }, 70, function () {
            });
          }
        });
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

        input1.on('click', function () {

          console.log("1111");
          if (_root.find("#pagination").val() == 0) {
            _root.find("#pagination").val("");
          }

        });



      },
      _destory = function () {
        _subManager.pageList.bookInfoCheck(_conf.bookExamine);
        _subManager.voiceManager.stopAllAudio();
        _subManager.voiceManager.voiceTestStop();
      },
      _checkExamineBookStatus = function () {
        _subManager.pageList.checkExamineBook(_conf.bookId, _destory());
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
        }
      };

  return {
    init: function (conf) {
      _init(conf);
    },
    loadPageData: function (pageId) {
      _loadPageData(pageId);
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
    checkExamineBookStatus: function () {
      _checkExamineBookStatus();
    }
  }
})();



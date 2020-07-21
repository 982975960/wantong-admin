wantong.cms.bookAdd = (function () {
  var
      _uploader = null,
      _uploadButtonIsShown = false,
      _uploadButton = null,
      _uploadContainer = null,
      _editButton = null,
      _speakerSelector = null,
      _root = null,
      _coverImage = null,
      _speakerValue = -1,
      _index = null,
      _lIndex = -1,
      _hintIndex = null,
      _exHintIndex = null,
      _changeRecordIndex = null,
      _moduleValue = 0,//
      _isClickSave = false,
      _isClickAddLabel = false,
      _isExBookMessageHint = false,
      _isChangeRecordStateHint = false,
      //书本的状态
      _bookState = 0,
      _bookInfoState = 0,
      _onlySave = '<div id = "onlySave" style= "text-align: center;margin-top: 40px">'
          + '<button type="button" class="btn btn-primary">仅退出，信息还需完善</button></div>',
      _changeBookStatus = '<div id = "changeBookStatus" style="text-align: center;margin-top: 30px">'
          + '<button type="button" class="btn btn-primary">已完成，移至下个环节</button></div>',

      _onlySaveNextEx = '<div id = "onlySaveNext" style= "text-align: center;margin-top: 40px">'
          + '<button type="button" class="btn btn-primary">仅退出，下次再审核</button></div>',
      _keepEx = '<div id = "keepEx" style="text-align: center;margin-top: 30px">'
          + '<button type="button" class="btn btn-primary" style="width: 149px">继续审核</button></div>',

      _onlySave_BookRecord = '<div id = "bookRecordOnlySave" style= "text-align: center;margin-top: 40px">'
          + '<button type="button" class="btn btn-primary">仅退出，下次继续修改</button></div>',
      _changeBookRecordState = '<div id = "changeRecordBookStatus" style="text-align: center;margin-top: 30px">'
          + '<button type="button" class="btn btn-primary">已完成，关闭书本</button></div>',
      _content = "",
      book = {
        'modelId': $("#modelId").val(),
        'template': 0,
        'authorToneColor': 0,
        'bookName': "",
        'authorName': "",
        'contentDescription': "",
        'edition': ""
      },
      _conf = {
        UPLOAD_URL: "upload.do",
        PREVIEW_IMAGE: "downloadTempFile.do",
        ADD_PAGE_URL: "cms/showAddPage.do",
        EDIT_FINGER_URL: "cms/showEditFinger.do",
        SAVE_BOOK_INFO: "cms/saveBookInfo.do",
        LOAD_BOOK_INFO: "cms/loadBookInfo.do",
        ADD_ALBEL_URL: "cms/addLabel.do",
        GET_BOOK_INFO: "cms/netBookInfo.do",
        GET_PROCESSED_IMAGE: "cms/getProcessImg.do",
        SET_BOOK_STATE: "cms/changeBookState.do",
        GET_LABEL_NAMES: "cms/getLabelNames",
        GET_BOOK_STATE: "cms/getBookState.do",
        CHANGE_RECORD_STATE_URL: "/cms/changeRecordBookState.do"
      },
      _init = function (conf) {
        $.extend(_conf, conf);
        console.log("2222");
        _root = $("#createBook");
        _uploadContainer = _root.find("#uploadBtn");
        _uploadButton = _root.find("#upload");
        _editButton = _root.find("#editBtn2");
        _moduleValue = conf.moduleValue,
            _bookState = conf.bookState,
            _bookInfoState = conf.bookInfoState,
            _index = layer.index;
        if (_conf.bookId > 0) {
          _loadData(_conf.bookId);
          _editButton.css('display', 'inline');
        }

        if (_conf.entryType == 1 && _conf.bookId > 0) {
          _root.find("#editLabel").css('display', 'none');
          _root.find("#saveAndNextBtn").css('display', 'none');
          _root.find("#enterBooks").css('display', 'none');
          _root.find("#editFinger").css('display', 'none');
          _root.find("#extraDataDiv").css('display', 'none');
          _root.find(".detail-course-bot").css('display', 'block');
          _root.find("#nbeDiv").css("height","385px");
          _showCourse();
        }

        _initBtnEvent();

        _initThumbnail();
        //init uploader component

        _editBtn(_editButton);

        // _initSpeakerSelector();

        _initSaveAndNextBtn();

        _initInputControls();

        _initAddLabel();

        _initScanListner();

        $("#isbn").focus();
      },
      _initAddLabel = function () {
        _root.find('#editLabel').on('click', function () {
          var bookId = $(this).attr("bookId");

          if (!_isClickAddLabel) {
            _isClickAddLabel = true;
            $.get(_conf.ADD_ALBEL_URL, {bookId: bookId, isMakePic: false},
                function (data) {
                  console.log("load labels ,tip msg");
                  if (data.code && data.code != 0) {
                    layer.msg(data.msg, {time: 3000, offset: 'auto'});
                    _isClickAddLabel = false;
                    return;
                  }
                  layer.open({
                    title: "添加书本标签",
                    type: 1,
                    maxmin: false,
                    area: ['800px', '600px'],
                    content: data,
                    success: function () {
                      console.log("success label end");
                    },
                    end: function () {
                      if (_isClickAddLabel) {
                        _isClickAddLabel = false;
                      }
                    }
                  });
                });
          }
        });
      },

      _loadData = function (bookId) {
        console.log("loadBook");
        $.ajax({
          url: _conf.LOAD_BOOK_INFO,
          type: "GET",
          async: false,
          contentType: "application/json",
          data: {
            bookId: _conf.bookId,
            repoId: _conf.modelId
          },
          dataType: 'json',
          success: function (data) {
            if (data.code == 0) {
              _conf.initData = data.data;
            } else {

            }
          }
        });
      },
      _getCurLabelDatas = function () {
        if (_conf.initData && _conf.initData.labels) {
          return _conf.initData.labels;
        }

        return null;
      },
      _loadLabels = function (data) {
        var labelData = null;
        $.ajax({
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          async: false,    //表示请求是否异步处理
          type: "post",    //请求类型
          url: _conf.GET_LABEL_NAMES,//请求的 URL地址
          data: JSON.stringify(data),
          dataType: "json",//返回的数据类型
          success: function (reData) {
            labelData = reData.data;
          },
          error: function () {
            layer.msg("添加标签失败")
          }
        });
        _conf.initData.labels = labelData;
        _initLabelsUI();
      },
      _initIsbnsView = function () {
        console.log('isbn init');
        var isbnsContainer = _root.find("#surplusIsbn");
        //清除所有surplus ISBN
        isbnsContainer.find('.surplus-isbn').parent(
            '.surplus-isbn-container').remove();
        if (!_conf.initData.isbns || _conf.initData.isbns.length < 1) {
          return;
        }

        var isbns = _conf.initData.isbns;
        for (var i = 0; i < isbns.length; i++) {
          var h = '<div class="surplus-isbn-container" pkval="' + isbns[i].id
              + '">';
          h += '<span class="surplus-isbn">' + isbns[i].isbn + '</span>';
          //h += '<span class="glyphicon glyphicon-remove"></span>';
          h += '</div>';

          //加入页面
          isbnsContainer.append(h);
        }
      },
      _loadCover = function (data) {
        _conf.initData.coverImage = data;
        _coverImage = data;
        _root.find("#coverImage").attr("src",
            "downloadTempFile.do?fileName=" + data);
      },
      _initInputControls = function () {
        if (_conf.initData) {
          var id = _root.find("#id");
          var name = _root.find("#name");
          var author = _root.find("#author");
          var description = _root.find("#description");
          var extraData = _root.find("#extraData");
          var isbn = _root.find("#isbn");
          var publish = _root.find("#publish");
          var seriesTitle = _root.find("#seriesTitle");
          var innerId = _root.find("#innerId");
          var edition = _root.find("#edition");
          id.text("BookID：" + _conf.initData.id);
          id.show();
          console.log("2222");
          name.val(_conf.initData.name);
          author.val(_conf.initData.author);
          description.val(_conf.initData.description)
          extraData.val(_conf.initData.extraData);
          isbn.val(_conf.initData.isbn);
          publish.val(_conf.initData.publisher);
          seriesTitle.val(_conf.initData.seriesTitle);
          edition.val(_conf.initData.edition);
          var re = /^[0-9]+.?[0-9]*$/;
          if (_conf.initData.innerId == "") {
            if (_conf.initData.name.indexOf("-") > -1 && re.test(
                _conf.initData.name.split("-")[0])) {
              innerId.val(_conf.initData.name.split("-")[0]);
            } else {
              innerId.val("");
            }
          } else {
            innerId.val(_conf.initData.innerId);
          }

          _initLabelsUI();
          _initIsbnsView();
        }
      },
      _initLabelsUI = function () {
        if (_conf.initData) {
          var theme = _root.find('#theme');
          theme.html('');
          var dom = '';
          if (_conf.initData.labels == null) {
            return;
          }
          var labels = _conf.initData.labels;
          var wtLabels = labels.wtLabels;
          var partnerLabels = labels.partnerLabels;

          dom += '<dl style="width:620px; background:#eeeeee; float:left; line-height:25px;">\n'
              +
              '              <span style="margin-left:130px; width:160px; float:left;">一级标签</span>\n'
              +
              '              <span style=" width:170px;float:left;">二级标签</span>\n'
              +
              '              <span style=" width:160px;float:left;">三级标签</span>\n'
              +
              '            </dl>\n' +
              '            <div>\n' +
              '              <div style="width:619px; float:left; border:1px solid #eeeeee; line-height:20px;" >';

          if (partnerLabels.length > 0) {
            $.each(partnerLabels, function (index1, item1) {
              dom += '<h3 class="vtOrPartner">客户标签</h3>' +
                  '<div class="labelDiv1">' +
                  '<div class="labelDiv2">' +
                  '<h4 class="lable-h4">' + item1.name + '</h4>' +
                  '<div class="labelDiv3">';
              $.each(item1.childNames, function (index2, item2) {
                var thirdLabelsStr = "";
                $.each(item2.childNames, function (index3, item3) {
                  if (index3 == item2.childNames.length - 1) {
                    thirdLabelsStr += item3.name
                  } else {
                    thirdLabelsStr += item3.name + " / ";
                  }
                });
                if (thirdLabelsStr == "") {
                  dom += '<p class="label-p">' +
                      '<span class="label-span-2" style="color: #3dbeed;">'
                      + item2.name + '</span>' +
                      '<span class="label-span-3 textline">' + thirdLabelsStr
                      + '</span>' +
                      '</p>';
                } else {
                  dom += '<p class="label-p">' +
                      '<span class="label-span-2">' + item2.name + '</span>' +
                      '<span class="label-span-3 textline" style="color: #3dbeed;">'
                      + thirdLabelsStr + '</span>' +
                      '</p>';
                }

              });
              dom += '</div></div></div>';
            });
          }
          if (wtLabels.length > 0) {
            $.each(wtLabels, function (index1, item1) {
              dom += '<h3 class="vtOrPartner">玩瞳标签</h3>' +
                  '<div class="labelDiv1">' +
                  '<div class="labelDiv2">' +
                  '<h4 class="lable-h4">' + item1.name + '</h4>' +
                  '<div class="labelDiv3">';
              $.each(item1.childNames, function (index2, item2) {

                var thirdLabelsStr = "";
                $.each(item2.childNames, function (index3, item3) {
                  if (index3 == item2.childNames.length - 1) {
                    thirdLabelsStr += item3.name
                  } else {
                    thirdLabelsStr += item3.name + " / ";
                  }
                });
                if (thirdLabelsStr == "") {
                  dom += '<p class="label-p">' +
                      '<span class="label-span-2" style="color: #3dbeed;">'
                      + item2.name + '</span>' +
                      '<span class="label-span-3 textline">' + thirdLabelsStr
                      + '</span>' +
                      '</p>';
                } else {
                  dom += '<p class="label-p">' +
                      '<span class="label-span-2">' + item2.name + '</span>' +
                      '<span class="label-span-3 textline" style="color: #3dbeed;">'
                      + thirdLabelsStr + '</span>' +
                      '</p>';
                }
              });
              dom += '</div></div></div>';
            });
          }
          dom += '</div></div>';
          if (wtLabels.length == 0 && partnerLabels.length == 0) {
            dom = "暂无标签";
            theme.html(dom);
          } else {
            theme.html(dom);
          }
        }
      },
      _initThumbnail = function () {
        if (_conf.initData) {
          _coverImage = _conf.initData.coverImage;
          _root.find("#coverImage").attr("src",
              GlobalVar.services.FDS + GlobalVar.services.BOOKIMAGEPATH + "/"
              + _conf.baseModelId + "/" + _conf.baseBookId
              + "/" + _coverImage);
        }
      },
      _fullScreen = function (callback) {
        _initFull();
        var dom = document.getElementById("full"); //需要全屏的dom
        if (!dom.fullscreenElement && // alternative standard method
            !dom.mozFullScreenElement && !dom.webkitFullscreenElement) {// current working methods
          //进入全屏
          console.log("进入全屏");
          if (dom.requestFullscreen) {
            dom.requestFullscreen();
          } else if (dom.mozRequestFullScreen) {
            dom.mozRequestFullScreen();
          } else if (dom.webkitRequestFullscreen) {
            dom.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
          }

          if (callback) {
            callback();
          }
          // 显示内部元素
          $('#full').css("display", "block");
        }
      },
      _exitFullScreen = function () {
        //该方法属于控制窗口主动退出全屏 全屏退出事件应在 onResize中设定
        var dom = document;//需要全屏的dom
        if (dom.exitFullscreen) {
          dom.exitFullscreen();
        } else if (dom.mozCancelFullScreen) {
          dom.mozCancelFullScreen();
        } else if (dom.webkitCancelFullScreen) {
          dom.webkitCancelFullScreen();
        }
      },
      checkFull = function () {
        if (document.fullscreenEnabled != undefined) {
          return document.fullscreen;
        }
        var isFull = window.fullScreen
            || document.webkitIsFullScreen || document.msIsFullScreen;
        //to fix : false || undefined == undefined
        if (isFull === undefined) {
          isFull = false;
        }
        return isFull;
      },
      _initFull = function () {
        window.onresize = function () {
          if (!checkFull()) {
            // 隐藏内部元素 暂停播放
            console.log("退出全屏");
            $('#full').css("display", "none");
          }
        }
      },
      _editCover = function () {
        var enter = true;
        $.ajax({
          type: "post",
          url: _conf.GET_PROCESSED_IMAGE,
          data: {
            bookId: _conf.baseBookId,
            modelId: _conf.modelId,
            taskId: _conf.taskId,
            examine: _conf.examine,
          },
          async: false,
          success: function (data) {
            if (data.code && data.code == 7) {
              layer.msg("请添加封面类型的书页");
              enter = false;
            } else {
              $('#full').html(data);
            }
          }
        });

        if (enter) {
          _fullScreen(function () {
          });
        }
      },
      /**点击图片编辑**/
      _editBtn = function () {
        _root.find('#editBtn2').on('click', function () {
          _editCover();
        })
      },
      _initSaveAndNextBtn = function () {
        //点击保存按钮
        _root.find("#saveAndNextBtn").click(function () {
          // _submitAndNext();

          if (!_isClickSave) {
            //用来控制电机保存按钮
            _isClickSave = true;
            _saveBookMessage(false, $(this));
          }
        });
        //点击进入输入按钮
        _root.find("#enterBooks").click(function () {
          $(this).blur();
          if (_conf.examine == "true") {
            _showExaminePageDialog(_conf.bookId, _conf.baseBookId)
          } else {
            _showAddPageDialog(_conf.bookId, _conf.baseBookId);
          }
        });
        _root.find("#editFinger").click(function () {
          $(this).blur();
          // if (_conf.examine == "true") {
          //   _showExamineFingerPageDialog(_conf.bookId, _conf.baseBookId)
          // } else {
          _showEditFingerDataDialog(_conf.bookId, _conf.baseBookId);
//          }
        });

      },

      _saveBookMessage = function (isEnter, jqObj) {
        var btnTxt = jqObj.html();
        jqObj.html(
            "<img style='width:20px; height:20px' src='" + GlobalVar.contextPath
            + "/static/images/loading.gif'> &nbsp;正在保存中").attr('disabled',
            true);
        var parameters = _setUpParameters();

        if (parameters == false) {
          jqObj.html(btnTxt).attr('disabled', false);
          _isClickSave = false;
          return;
        }
        $.post(_conf.SAVE_BOOK_INFO, parameters, function (response) {
          if (response.code == 0) {
            layer.msg("数据保存成功");
          } else {
            layer.msg("数据保存失败");
          }
        }, "json").fail(function () {
          layer.msg("服务无响应");
        }).always(function () {
          jqObj.html(btnTxt).attr('disabled', false);

          if (_isClickSave) {
            _isClickSave = false;
          }
        });
      },
      _showExamineFingerPageDialog = function (bookId, baseBookId) {
        $.get(_conf.EDIT_FINGER_URL, {
          bookId: bookId,
          baseBookId: baseBookId,
          bookExamine: true,
          moduleValue: _moduleValue,
          bookState: _bookState,
          repoId: _conf.modelId
        }, function (html) {
          var layerIndex = layer.index;
          layer.open({
            title: "编辑书页 - 《" + _conf.initData.name + "》",
            type: 1,
            maxmin: false,
            resize: false,
            area: ['1200px', '820px'],
            scrollbar: true,
            content: html,
            end: function () {
              wantong.cms.booklist_resource.refreshCurrentPage();
            },
            cancel: function () {
              wantong.cms.pageAdd.checkExamineBookStatus();
              wantong.cms.booklist_resource.refreshEvent();
            }
          });
          layer.close(layerIndex);
        });
      },
      _showExaminePageDialog = function (bookId, baseBookId) {
        $.get(_conf.ADD_PAGE_URL, {
          bookId: bookId,
          baseBookId: baseBookId,
          bookExamine: true,
          moduleValue: _moduleValue,
          bookState: _bookState,
          repoId: _conf.modelId
        }, function (html) {
          var layerIndex = layer.index;
          layer.open({
            title: "审核书页 - 《" + _conf.initData.name + "》",
            type: 1,
            maxmin: false,
            resize: false,
            area: ['1200px', '800px'],
            scrollbar: true,
            content: html,
            end: function () {
              setTimeout(() => {
                wantong.cms.booklist_resource.refreshCurrentPage();
              }, 1000);
            },
            cancel: function () {
              wantong.cms.pageAdd.checkExamineBookStatus();
              return false;
            }
          });
          wantong.cms.booklist_resource.refreshEvent();
          layer.close(layerIndex);
        });
      },
      _showEditFingerDataDialog = function (bookId, baseBookId) {
        $.get(_conf.EDIT_FINGER_URL, {
          bookId: bookId,
          baseBookId: baseBookId,
          moduleValue: _moduleValue,
          bookState: _bookState,
          repoId: _conf.modelId
        }, function (html) {
          var layerIndex = layer.index;
          layer.close(layerIndex);
          layerIndex = layer.open({
            title: "添加书页资源 - 《" + _conf.initData.name + "》",
            type: 1,
            maxmin: false,
            resize: false,
            area: ['100%', '100%'],
            offset: 'lt',
            scrollbar: true,
            content: html,
            success: function (layero) {
              var html = $(layero).find(".layui-layer-setwin").prop(
                  "outerHTML");
              $(layero).find(".layui-layer-setwin").remove();
              $(layero).append(html);
            },
            end: function () {
              wantong.cms.booklist_resource.refreshCurrentPage();
            },
            cancel: function () {
              if (_bookState == 0) {
                _showSaveBookMessageHintFrame();
                return false;
              }
              wantong.cms.pageAdd.destory();
              if (wantong.cms.pageAdd.flag && $('#saveAndNextButton').attr(
                  'disabled') != 'disabled') {
                layer.confirm('当前书页有资源尚未保存', {
                  title: '提示',
                  btn: ['确认保存', '取消保存'] //按钮
                }, (index) => {
                  $('#saveAndNextButton').click();
                  return false;
                }, () => {
                  layer.close(layerIndex);
                });
                return false;
              }

            }
          });
          layer.full(layerIndex);
          wantong.cms.booklist_resource.refreshEvent();
          setTimeout(() => {
            //#变更后的基本样式
            $('#picManager').css('float', 'left');
            $('#picManager').css('height', 'auto');
            $('#picManager').css('margin-top', '37px');
            //右侧悬浮
            //$('.right-container').css('position', 'fixed');
            //$('.right-container').css('z-index', '10');
            //$('.right-container').css('right', '30px');
            //防止遮挡上部
            $('.right-container').css('margin-top', '40px');
            $('.right-container').css('padding-top', '20px');
            $('.right-container').css('background', '#FFF');
            //弹窗内高铺满
            $('#pageAdd').height('100%');
            //标题
            $('.page-container').css('position', 'fixed');
            $('.page-container').css('z-index', '1');
            $('.page-container').css('top', '40px');
            //左侧悬浮
            $('#pageListContainer').css('position', 'fixed');
            $('#pageListContainer').css('background', '#FFF');
            $('#pageListContainer').css('width', '201px');
            $('#pageListContainer').css('top', '80px');
            //语音框
            //$('#bookEdit .voice-progress-bar').css('margin-left', '20px');
            //$('#bookEdit #voiceManager').css('margin-left', '20px');
            // $('#bookEdit #voiceManager').css('background', '#FFF');
            // $('#bookEdit #voiceManager .col-md-12').css('background', '#ddd');
            // $('#bookEdit #voiceManager .col-md-12').css('border', '1px solid #ddd');
            $('#extra-data').css('width', '100%');
            $('#extra-data').css('height', '100%');
            $('.panel-body').css('width', '100%');
            $('.panel-body').css('height', '100%');
            $('#extraDataText').css('width', '100%');
            $('#extraDataText').css('height', '100%');
            $('#evalText').css('width', '100%');
            $('#evalText').css('height', '100%');
            $('.eval-text').css('width', '100%');
            $('.eval-text').css('height', '100%');
            $('#videoText').css('width', '100%');
            $('#videoText').css('height', '100%');
            $('.video-text').css('width', '100%');
            $('.video-text').css('height', '100%');
            wantong.cms.pageAdd.resizeCalc();
          }, 100);
        });
      },
      _showAddPageDialog = function (bookId, baseBookId) {
        $.get(_conf.ADD_PAGE_URL, {
          bookId: bookId,
          baseBookId: baseBookId,
          moduleValue: _moduleValue,
          bookState: _bookState,
          repoId: _conf.modelId
        }, function (html) {
          var layerIndex = layer.index;
          layer.close(layerIndex);
          layer.open({
            title: "编辑书页资源 - 《" + _conf.initData.name + "》",
            type: 1,
            maxmin: false,
            resize: false,
            area: ['1200px', '800px'],
            scrollbar: false,
            content: html,
            end: function () {
              setTimeout(() => {
                wantong.cms.booklist_resource.refreshCurrentPage();
              }, 1000);
            },
            cancel: function () {
              if (_moduleValue != -1) {
                if (_bookState == 1 || (_bookState == 5 && _bookInfoState
                    == 0)) {
                  _showSaveBookMessageHintFrame();
                  return false;
                }
                if (_bookState == 4) {
                  $.get(_conf.GET_BOOK_STATE, {bookId: bookId},
                      function (data) {
                        if (data.code == 0) {
                          if (parseInt(data.data) != 3 && parseInt(data.data)
                              != 11) {
                            layer.msg("资源需要重新审核，已移至待审核")
                          }
                        }

                      });
                }
              } else {
                _showChangeBookRecordStateHint();
                return false;
              }
              wantong.cms.pageAdd.destory();
            }
          });
        });
      },

      _showChangeBookRecordStateHint = function () {
        var content = _onlySave_BookRecord + _changeBookRecordState;
        if (!_isChangeRecordStateHint) {
          _isChangeRecordStateHint = true;
          _changeRecordIndex = layer.open({
            type: 1,
            shade: 0.3,
            title: false,
            area: ['300px', '200px'],
            content: content,
            success: function (layero, index) {

            },
            cancel: function () {
              layer.close();
            },
            end: function () {
              _isChangeRecordStateHint = false;
            }
          });
        }
      },
      _showExBookMessageHintFrame = function () {
        var content = _onlySaveNextEx + _keepEx;
        if (!_isExBookMessageHint) {
          _isExBookMessageHint = true;
          _exHintIndex = layer.open({
            type: 1,
            shade: 0.3,
            title: false,
            area: ['300px', '200px'],
            content: content,
            success: function (layero, index) {

            },
            cancel: function () {
              layer.close();
            },
            end: function () {
              _isExBookMessageHint = false;
            }
          });
        }
      },
      //书本编辑也保存后的提示
      _showSaveBookMessageHintFrame = function () {
        _content = _onlySave + _changeBookStatus;
        _hintIndex = layer.open({
          type: 1,
          shade: 0.3,
          title: false,
          area: ['300px', '200px'],
          content: _content,
          success: function (layero, index) {

          },
          cancel: function () {
            layer.close();
          }
        });
      },
      _initScanListner = function () {
        scannerConnector.setImageListener(function (data) {
          var blob = _convertBase64ToBlob(data);
          var formData = new FormData();
          formData.append("file", blob);
          $.ajax({
            url: _conf.UPLOAD_URL,
            type: 'POST',
            cache: false,
            data: formData,
            processData: false,
            contentType: false
          }).success(function (response) {
            if (response.code != 0) {
              return;
            }
            _coverImage = response.data.fileName;
            var imagePath = response.data.fileName;
            _root.find("#coverImage").attr("src",
                _conf.PREVIEW_IMAGE + "?fileName=" + imagePath);

          }).error(function (response) {
            layer.msg("上传图片失败");
          });
        });
        scannerConnector.setMessageListener(function (data) {
          console.log("bookId:" + _conf.bookId);
          console.log("data:" + data);
          var re = /^[0-9]+.?[0-9]*$/;
          if ($("#createBook").length == 0) {
            console.log("创建书本窗口未打开。");
            return;
          }
          if ($("#labelWarpper").length != 0) {
            console.log("添加书本标签窗口打开。");
            return;
          }
          if (!re.test(data.data)) {
            //data为非纯数字则为图片路径 纯数字则为isbn
            _root.find("#coverImage").attr("src",
                _conf.PREVIEW_IMAGE + "?fileName=" + data.data);
            return;
          }
          $("#isbn").val(data.data || "");
          $.get(_conf.GET_BOOK_INFO, {
                isbn: data.data
              }, function (data) {
                if (data.code != 0) {
                  layer.msg("查询不到此书, 请手动输入");
                  _root.find("#coverImage").attr("src", "static/images/temp.jpg");
                  _coverImage = "temp.jpg";
                  return;
                }
                var bookData = JSON.parse(data.data);
                if (bookData == null) {
                  layer.msg("查询不到此书, 请手动输入");
                  _root.find("#coverImage").attr("src", "static/images/temp.jpg");
                  _coverImage = "temp.jpg";
                  return;
                }
                _coverImage = bookData.image;
                _root.find("#coverImage").attr("src",
                    _conf.PREVIEW_IMAGE + "?fileName=" + _coverImage);
                $("#name").val(bookData.title || "");
                var author = "";
                for (var i = 0; i < bookData.author.length; i++) {
                  author += bookData.author[i];
                }
                $("#author").val(author || "");
                $("#isbn").val(bookData.isbn || "");
                $("#publish").val(bookData.publisher || "");
                $("#seriesTitle").val(bookData.seriesTitle || "");
                $("#description").val(bookData.summary || "");
              }
          );
        });
      },
      _setUpParameters = function () {
        var extraData = _root.find("#extraData");
        if (extraData.val().length > 5000) {
          layer.msg("书本简介长度不能超过5000个字");
          return false;
        }
        var bookId = 0;
        if (_conf.initData) {
          bookId = _conf.bookId;
        }
        return {
          bookId: bookId,
          modelId: _conf.modelId,
          extraData: extraData.val()
        };
      },
      _initBtnEvent = function () {
        $("body").off("click", "#onlySave .btn").on("click", "#onlySave .btn",
            function () {
              layer.closeAll();
              wantong.cms.pageAdd.destory();
              wantong.cms.booklist_resource.refreshCurrentPage();
              wantong.cms.booklist_resource.refreshEvent();
            });

        $("body").off("click", "#changeBookStatus .btn").on("click",
            "#changeBookStatus .btn", function () {
              let isAuth = JSON.parse($("#allowNull").attr("isAllow"));
              $.get(_conf.SET_BOOK_STATE + "?bookId=" + _conf.bookId + "&state="
                  + 7 + "&isAuth=" + isAuth, {}, function (data) {
                if (data.code == 0) {
                  layer.closeAll();

                  wantong.cms.booklist_resource.refreshCurrentPage();
                  wantong.cms.booklist_resource.refreshEvent();
                  if (wantong.cms.pageAdd != undefined) {
                    wantong.cms.pageAdd.destory();
                  }
                } else {
                  layer.close();
                  layer.msg(data.msg);
                }

              })
            });

        $("body").off("click", "#onlySaveNext .btn").on("click",
            "#onlySaveNext .btn", function () {
              layer.closeAll();
              wantong.cms.booklist_resource.refreshEvent();
            });

        $("body").off("click", "#keepEx .btn").on("click", "#keepEx .btn",
            function () {
              layer.close(_exHintIndex);
            });
        $("body").off("click", "#changeRecordBookStatus .btn").on("click",
            "#changeRecordBookStatus .btn", function () {
              // 修改书本记录
              $.get(_conf.CHANGE_RECORD_STATE_URL, {
                bookId: _conf.bookId,
                state: 1
              }, function (data) {
                if (data.code == 0) {
                  layer.closeAll();
                  wantong.cms.booklist_resource.refreshEvent();
                  wantong.cms.booklist_resource.refreshCurrentPage();

                  if (wantong.cms.pageAdd != undefined) {
                    wantong.cms.pageAdd.destory();
                  }
                } else {
                  layer.msg("服务异常");
                }
              });
            });
        $("body").off("click", "#bookRecordOnlySave .btn").on("click",
            "#bookRecordOnlySave .btn", function () {
              layer.closeAll();
              wantong.cms.booklist_resource.refreshEvent();
            });
      },

      _closeBookMessageLayer = function () {
        layer.close(_index);
      },
      _convertBase64ToBlob = function (base64) {
        var mime = 'image/jpg';
        var bytes = window.atob(base64);

        //处理异常,将ascii码小于0的转换为大于0
        var ab = new ArrayBuffer(bytes.length);
        var ia = new Uint8Array(ab);
        for (var i = 0; i < bytes.length; i++) {
          ia[i] = bytes.charCodeAt(i);
        }

        return new Blob([ab], {type: mime});
      },
      _destroy = function() {
        console.log('开始销毁message监听');
        window.removeEventListener('message', _handleNbeEvent);
        window.removeEventListener('message', _closeAddEnterAudio);
      },
      _handleNbeEvent = function(event) {
        //到NBE编辑器
        if (event.data.cmd === 'editResource') {
          var url = "/nbe/toNbeEditor?bookId="+_conf.bookId + "&packageId=" + event.data.data.packageId;
          var indexTpl = layer.open({
            title: 'NBE',
            type: 2,
            content: url,
            maxmin: false,
            area: ['100%', '90%'],
            success: function (layero, index) {
              // 新iframe窗口的对象
              var iframeWin = layero.find('iframe')[0].contentWindow;
              // 重新渲染checkbox,select同理
              iframeWin.layui.form.render('checkbox');
            },
          });
          layer.full(indexTpl);
        }

        if (event.data.cmd === 'addEnterAudio') {
          console.log('data', event.data);
          var url = "/nbe/toNbeEnterAudio?bookId="+_conf.bookId + "&packageId=" + event.data.data.packageId;
          var indexTpl = layer.open({
            title: 'NBE',
            type: 2,
            content: url,
            maxmin: true,
            area: ['73%', '60%'],
            success: function (layero, index) {
              // 新iframe窗口的对象
              var iframe = layero.find('iframe')[0];
              var iframeWin = iframe.contentWindow;
              // 重新渲染checkbox,select同理
              // iframeWin.layui.form.render('checkbox');
              window.addEventListener('message', _closeAddEnterAudio, false);
            },
            end: function () {
              window.removeEventListener('message', _closeAddEnterAudio);
            }
          });
          layer.full(indexTpl);
          _lIndex = indexTpl;
        }
      },
      _closeAddEnterAudio = function(event) {
          if (event.data.cmd === 'close') {
            console.log('关闭窗口');
            layer.close(_lIndex);
          }
      },
      _showCourse = function () {
        console.log("adddddddddddd");
        //到NBE资源包列表页面
        var iframe = $('.detail-course-bot iframe');
        iframe.attr('src',"/nbe/toNbePackageList?entityId="+_conf.bookId);
        //监听从NBE发送回来的事件
        iframe.load(function () {
          console.log('加载完毕');
          window.addEventListener('message', _handleNbeEvent, false);
        });
      };
  return {
    init: function (conf) {
      _init(conf);
    },
    loadLabels: function (data) {
      _loadLabels(data);
    },
    loadCover: function (data) {
      _loadCover(data);
    },
    getCurLabelDatas: function () {
      return _getCurLabelDatas();
    },
    exitFullSreen: function () {
      _exitFullScreen();
    },
    editCover: function () {
      _editCover();
    },
    showExBookMessageHintFrame: function () {
      _showExBookMessageHintFrame();
    },
    destroy: function () {
      _destroy();
    }
  }
})();
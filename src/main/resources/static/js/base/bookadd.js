
wantong.base.bookAdd = (function () {
  var
      _uploader = null,
      _uploadButtonIsShown = false,
      _uploadButton = null,
      _uploadContainer = null,
      _editButton = null,
      _root = null,
      _coverImage = null,
      _index = null,
      _hintIndex = null,
      _isClickAddLabel = false,
      _moduleValue = 0,//
      //书本的状态
      _bookState = 0,
      _bookInfoState = 0,
      _onlySave = '<div id = "onlySave" style= "text-align: center;margin-top: 40px">'
          + '<button type="button" class="btn btn-primary" style="width: 180px;">仅退出，信息还需完善</button></div>',
      _changeBookStatus = '<div id = "changeBookStatus" style="text-align: center;margin-top: 30px">'
          + '<button type="button" class="btn btn-primary" style="width: 180px;">已完成，移至下个环节</button></div>',
      _examineSave = '<div id = "onlySave" style= "text-align: center;margin-top: 40px;">'
          + '<button type="button" class="btn btn-primary" style="width: 180px;">仅退出，审核未完成</button></div>',
      _examineNext = '<div id = "changeBookStatus" style="text-align: center;margin-top: 30px">'
          + '<button type="button" class="btn btn-primary" style="width: 180px;">审核完成，移至下个环节</button></div>',
      _makingSave = '<div id = "onlySave" style= "text-align: center;margin-top: 40px">'
          + '<button type="button" class="btn btn-primary" style="width: 180px;">仅退出，采样待完善</button></div>',
      _makingNext = '<div id = "changeBookStatus" style="text-align: center;margin-top: 30px">'
          + '<button type="button" class="btn btn-primary" style="width: 180px;">完成，移至下个环节</button></div>',

      _content = "",
      _nextState = 1,
      book = {
        'modelId': $("#modelId").val(),
        'template': 0,
        'authorToneColor': 0,
        'bookName': "",
        'authorName': "",
        'contentDescription': "",
        'edition': ""
      },

      //管理用户的权限
      _authorityManagement = {
        upLoadCoverImage: false,
        editorBookInformation: false
      },
      _conf = {
        UPLOAD_URL: "upload.do",
        PREVIEW_IMAGE: "downloadTempFile.do",
        ADD_PAGE_URL: "base/showAddPage.do",
        SAVE_BOOK_INFO: "base/saveBookInfo.do",
        LOAD_BOOK_INFO: "base/loadBookInfo.do",
        ADD_ALBEL_URL: "cms/addLabel.do",
        GET_BOOK_INFO: "base/netBookInfo.do",
        GET_PROCESSED_IMAGE: "base/getProcessImg.do",
        SET_BOOK_STATE: "base/changeBookState.do",
        GET_LABEL_NAMES: "cms/getLabelNames",
        AUTO_SET_COVER_IMAGE: "base/autoSetCoverImage"
      },
      _init = function (conf) {
        $.extend(_conf, conf);
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
        _checkModuleState();

        _initBtnEvent();

        _initThumbnail();
        //init uploader component

        _initUploadBtn(_uploadButton);

        _initUserAuthority();

        _editBtn(_editButton);

        _initSaveAndNextBtn();

        _initInputControls();

        _initAddLabel();

        _initScanListner();

        _initSurplusAddEvent();

        _initWorkOrderBook();

        $("#isbn").focus();
      },
      _initWorkOrderBook = function () {
        var isWorkOrder = _conf.isWorkOrder;
        if (isWorkOrder !== "" && isWorkOrder !== undefined){
          if (parseInt(isWorkOrder) === 1){
            _root.find("#enterBooks").remove();
          }
        }

      },
      _initAddLabel = function () {
        _root.find('#editLabel').on('click', function () {
          var bookId = _conf.bookId;
          if (!_isClickAddLabel) {
            _isClickAddLabel = true;
            if (bookId == -1) {
              layer.msg("请先添加并保存书本信息");
              _isClickAddLabel = false;
              return;
            }
            $.get(_conf.ADD_ALBEL_URL,
                {
                  bookId: bookId,
                  isMakePic: true
                },
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
                    },end:function () {
                      if(_isClickAddLabel){
                        _isClickAddLabel = false;
                      }
                    }
                  });
                });
          }
        });
      },
      _initUserAuthority = function () {
        _authorityManagement.upLoadCoverImage = JSON.parse(
            $("#uploadBtn").attr("isAuthority"));
        _authorityManagement.editorBookInformation = JSON.parse(
            $(".form-group").find("#isbn").attr("isAuthority"));
      },
      _loadData = function (bookId) {
        console.log("loadBook:" + _conf.bookId);
        $.ajax({
          url: _conf.LOAD_BOOK_INFO,
          type: "GET",
          async: false,
          contentType: "application/json",
          data: {
            bookId: _conf.bookId
          },
          dataType: 'json',
          success: function (data) {
            if (data.code == 0) {
              _conf.initData = data.data;
              console.log("112313");
            } else {
              //do error
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
            layer.msg("添加标签失败");
          }
        });
        _conf.initData.labels = labelData;
        _initLabelsUI();
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
          var isbn = _root.find("#isbn");
          var publish = _root.find("#publish");
          var seriesTitle = _root.find("#seriesTitle");
          var innerId = _root.find("#innerId");
          var edition = _root.find("#edition");
          var sku = _root.find("#skuId");
          id.text("BookID：" + _conf.initData.id);
          id.show();
          name.val(_conf.initData.name);
          author.val(_conf.initData.author);
          description.val(_conf.initData.description)
          isbn.val(_conf.initData.isbn);
          publish.val(_conf.initData.publisher);
          seriesTitle.val(_conf.initData.seriesTitle);
          edition.val(_conf.initData.edition);
          sku.val(_conf.initData.sku);
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
      _checkIsbnInputsRepeat = function() {
        console.log('check repeat');
        var check = true;
        var isbns = [];
        _root.find('.surplus-isbn').each((i,e) => {
          if (!check) {
          return;
        }

        var t = $(e);
        var isbn = t.val();

        if (isbns.indexOf(isbn) > -1) {
          t.focus();
          check = false;
          return;
        } else {
          isbns.push(isbn);
        }
      });

        return check;
      },
      _checkIsbnInputsLen = function() {
        var check = true;
        _root.find('.surplus-isbn').each((i,e) => {
          if (!check) {
          return;
        }

        var t = $(e);
        var isbn = t.val();
        if (isbn.length != 10 && isbn.length != 13) {
          t.focus();
          check = false;
          return;
        }
      });

        return check;
      },
      _checkIsbnInputsNull = function() {
        var check = true;
        _root.find('.surplus-isbn').each((i,e) => {
          if (!check) {
          return;
        }

        var t = $(e);
        var isbn = t.val();
        if (isbn == '') {
          t.focus();
          check = false;
          return;
        }
      });

        return check;
      },
      _getIsbnDom = function(id, isbn) {
        if ($(".isbn-btn").css("display")=="none"){
          var h = '<div class="surplus-isbn-container" pkval="' + id + '">';
          h += '<input class="surplus-isbn" onkeyup="this.value=this.value.replace(/[^0-9]+/,\'\');" type="text" placeholder="请输入10或13位纯数字" maxlength="13" disabled="disabled" style="background: white"/>';
          h += '</div>';
          var tempDom = $(h);
          tempDom.find('.surplus-isbn').val(isbn);
          tempDom.find('.surplus-isbn').blur(function() {
            // console.log('aaaaaaaaaaa');
            // if (!_root.find('#saveAndNextBtn').is(":focus") && !_checkIsbnInputsRepeat()) {
            //   //layer.msg("该ISBN已存在");
            // }
          });

          return tempDom;
        } else {
          var h = '<div class="surplus-isbn-container" pkval="' + id + '">';
          h += '<input class="surplus-isbn" onkeyup="this.value=this.value.replace(/[^0-9]+/,\'\');" type="text" placeholder="请输入10或13位纯数字" maxlength="13"/>';
          h += '<span class="glyphicon glyphicon-remove"></span>';
          h += '</div>';
          var tempDom = $(h);
          tempDom.find('.surplus-isbn').val(isbn);
          tempDom.find('.surplus-isbn').blur(function() {
            // console.log('aaaaaaaaaaa');
            // if (!_root.find('#saveAndNextBtn').is(":focus") && !_checkIsbnInputsRepeat()) {
            //   //layer.msg("该ISBN已存在");
            // }
          });

          return tempDom;
        }
      },
      _addISBNRemoveBtnEvent = function(t) {
        t.find('.glyphicon-remove').click(function() {
          var that = this;
          var isbn = $(that).parent('.surplus-isbn-container').find(".surplus-isbn").val();
          if (isbn == ""){
            $(that).parent('.surplus-isbn-container').remove();
          } else {
            var index = layer.confirm('<div style="color: black;">您确定删除这个附属ISBN号吗？</div>'
                + '<div>删除后，将会导致家长端扫书本条形码时，如果扫的这本书正好唯一对应是这个要删除附属ISBN号，就会被反馈为，这本扫的书不支持。</div>', {
              title:'删除附属ISBN',
              btn: ['确定'] //按钮
            }, function(){
              $(that).parent('.surplus-isbn-container').remove();
              layer.close(index);
            });
          }

        });
      },
      _initSurplusAddEvent = function() {
        console.log('click event');
        _root.find('.isbn-btn').click(function () {
          if (!_checkIsbnInputsNull()) {
            return;
          }

          var t = _getIsbnDom(0, '');
          _addISBNRemoveBtnEvent(t);

          //加入页面
          _root.find('.isbn-btn').before(t);
          console.log('focus');
          t.find('.surplus-isbn').focus();
        });
      },
      _initIsbnsView = function () {
        console.log('isbn init');
        //创建初始化
        var isbnsContainer = _root.find("#surplusIsbn");
        var isbnAddBtn = _root.find('.isbn-btn');

        //初始数据初始化
        //清除所有surplus ISBN
        isbnsContainer.find('.surplus-isbn').parent('.surplus-isbn-container').remove();
        if (!_conf.initData.isbns || _conf.initData.isbns.length < 1) {
          return;
        }

        var isbns = _conf.initData.isbns;
        for (var i = 0; i < isbns.length; i++) {
          var tempDom = _getIsbnDom(isbns[i].id, isbns[i].isbn);
          _addISBNRemoveBtnEvent(tempDom);

          //加入页面
          isbnAddBtn.before(tempDom);
        }
      },
      _initLabelsUI = function () {
        if (_conf.initData) {
          var theme = _root.find('#theme');
          theme.html('');
          var dom = '';
          if(_conf.initData.labels == null){
            return;
          }
          var labels = _conf.initData.labels;
          var wtLabels = labels.wtLabels;
          var partnerLabels = labels.partnerLabels;

          dom += '<dl style="width:600px; background:#eeeeee; float:left; line-height:25px;">\n' +
            '              <span style="margin-left:110px; width:160px; float:left;">一级标签</span>\n' +
            '              <span style=" width:170px;float:left;">二级标签</span>\n' +
            '              <span style=" width:160px;float:left;">三级标签</span>\n' +
            '     </dl>\n' +
            '     <div>\n' +
            '       <div style="width:599px; float:left; border:1px solid #eeeeee; line-height:20px;">';
          if (partnerLabels.length > 0) {
            $.each(partnerLabels, function (index1, item1) {
              dom += '<h3 class="vtOrPartner">客户标签</h3>' +
                  '<div class="labelDiv1">' +
                  '<div class="labelDiv2">' +
                  '<h4 class="lable-h4">' + item1.name + '</h4>'+
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
                if(thirdLabelsStr == ""){
                  dom += '<p class="label-p">' +
                            '<span class="label-span-2" style="color: #3dbeed;">' + item2.name + '</span>' +
                            '<span class="label-span-3 textline">'+ thirdLabelsStr +'</span>' +
                          '</p>';
                }else {
                  dom +='<p class="label-p">' +
                      '<span class="label-span-2">' + item2.name + '</span>' +
                      '<span class="label-span-3 textline" style="color: #3dbeed;">'+ thirdLabelsStr +'</span>' +
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
                  '<h4 class="lable-h4">' + item1.name + '</h4>'+
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
                if(thirdLabelsStr == ""){
                  dom += '<p class="label-p">' +
                      '<span class="label-span-2" style="color: #3dbeed;">' + item2.name + '</span>' +
                      '<span class="label-span-3 textline">'+ thirdLabelsStr +'</span>' +
                      '</p>';
                }else {
                  dom += '<p class="label-p">' +
                      '<span class="label-span-2">' + item2.name + '</span>' +
                      '<span class="label-span-3 textline" style="color: #3dbeed;">'+ thirdLabelsStr +'</span>' +
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
          }else {
            theme.html(dom);
          }
        }
      },
      _initThumbnail = function () {
        //must hide upload button after a while, otherwise the uploder cannot be init successful.
        setTimeout(function () {
          //_uploadButton.hide();
          _uploadContainer.hide();
        }, 100);
        _root.find("#thumbnail").mouseover(function () {
          _showUploadButton();
        });
        _uploadContainer.mouseover(function () {
          _showUploadButton();
        });
        _root.find("#thumbnail").mouseout(function () {
          _hideUploadButton();
        });
        _uploadContainer.mouseout(function () {
          _hideUploadButton();
        });
        if (_conf.initData) {
          _coverImage = _conf.initData.coverImage;
          _root.find("#coverImage").attr("src",
              GlobalVar.services.FDS + GlobalVar.services.BOOKIMAGEPATH + "/"
              + _conf.modelId + "/" + _conf.bookId
              + "/" + _coverImage);
        }
      },
      _showUploadButton = function () {
        if (!_uploadButtonIsShown) {
          _uploadContainer.show();
          _uploadButtonIsShown = true;
        }
      },
      _hideUploadButton = function () {
        if (_uploadButtonIsShown) {
          _uploadContainer.hide();
          _uploadButtonIsShown = false;
        }
      },
      _initUploadBtn = function (pickId) {
        _uploader = WebUploader.create({
          swf: GlobalVar.contextPath + '/js／uploader/Uploader.swf',
          server: _conf.UPLOAD_URL + "?check=" + true,
          fileSingleSizeLimit: 5 * 1024 * 1024,
          pick: {
            id: pickId,
            multiple: false
          },
          dnd: "#thumbnailContainer",
          accept: {
            title: 'JPG',
            extensions: 'jpg,jpeg',
            mimeTypes: 'image/jpeg'
          },
          auto: true,
          method: "POST",
          duplicate: true,
          disableGlobalDnd: false
        });
        bindUploaderValidator(_uploader, 'g');

        _uploader.on('uploadSuccess', function (file, response) {
          if (response.code == 0) {
            _coverImage = response.data.fileName;
            _root.find("#coverImage").attr("src",
                _conf.PREVIEW_IMAGE + "?fileName=" + _coverImage);
          } else {
            layer.msg(response.msg);
          }

        });
        _uploader.on("error", function (type) {
          if (type == "Q_TYPE_DENIED") {
            layer.msg("请上传jpeg格式的文件，如img.jpg或img.jpeg等");
          } else if (type == "F_EXCEED_SIZE") {
            layer.msg("封面图大小不能超过5M");
          } else {
            layer.msg("请上传jpeg格式的文件，如img.jpg或img.jpeg等");
          }
        });
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
            bookId: _conf.bookId,
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
        //_root.delegate("#editBtn2", "click", function (event) {
        _root.find('#editBtn2').on('click', function () {
          _editCover();
        })
      },
      _initSaveAndNextBtn = function () {
        //点击保存按钮
        _root.find("#saveAndNextBtn").click(function () {
          // _submitAndNext();
          _saveBookMessage(false, $(this));
        });
        //点击进入输入按钮
        _root.find("#enterBooks").click(function () {
          console.log("_conf.bookId:" + _conf.bookId);
          if (_conf.bookId == null || _conf.bookId == -1) {
            layer.msg("请先添加书本信息并保存");
            return;
          }

          $(this).blur();
          if (_conf.examine == "true") {
            _showExaminePageDialog(_conf.bookId);
          } else {
            _showAddPageDialog(_conf.bookId);
          }

        })
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
          return;
        }
        $.ajax({
          type: "post",
          url: _conf.SAVE_BOOK_INFO,
          data: parameters,
          //contentType: "application/json; charset=utf-8",
          dataType: "json",
          success: function (response) {
            if (response.code == 0) {
              if (isEnter) {
                if (_conf.examine == "true") {
                  _showExaminePageDialog(response.data.bookId);
                } else {
                  _conf.bookId = response.data.bookId;
                  //是否进入书页
                  layer.closeAll();
                  _showAddPageDialog(response.data.bookId);
                }
              } else {
                _conf.bookId = response.data.bookId;
                _loadData(_conf.bookId);
                //_showSaveBookMessageHintFrame(true);
                layer.msg("保存成功");
                _root.find("#saveAndNextBtn").attr("disabled", "disabled");
              }
            } else if (response.code == 20057) {
              layer.open({
                title: '提示'
                ,content: '已检测到存在相同"绘本名称"和"ISBN或附属ISBN"的书本，请修改'
              });
            }else {
              layer.msg("数据保存失败");
            }
          }
        }).fail(function () {
          layer.msg("服务无响应");
        }).always( function () {
          jqObj.html(btnTxt).attr('disabled', false);
        });
      },
      _showExaminePageDialog = function (bookId, _con) {
        $.get(_conf.ADD_PAGE_URL, {
          bookId: bookId,
          bookExamine: true,
          moduleValue: _moduleValue,
          bookState: _bookState,
          bookInfoState: _bookInfoState,
          modelId: _conf.modelId
        }, function (html) {
          var layerIndex = layer.index;
          layer.open({
            title: "审核书页 - 《"+ _conf.initData.name + "》",
            type: 1,
            maxmin: false,
            resize: false,
            area: ['1200px', '800px'],
            scrollbar: true,
            content: html,
            end: function () {
              wantong.base.booklist.search.refreshCurrentPage(_conf.modelId,true);
            },
            cancel: function () {
              console.log("待审核");
              if (_bookState == 0 || _bookState == 1 || _bookState == 7 || (_bookState==4 && _bookInfoState==0)|| (_bookState==4 && _bookInfoState==1)|| (_bookState==4 && _bookInfoState==7)) {
                _showSaveBookMessageHintFrame(false);
                return false;
              }
              wantong.base.pageAdd.checkExamineBookStatus();
            }
          });
          layer.close(layerIndex);
        });
      },
      _showAddPageDialog = function (bookId) {
        $.get(_conf.ADD_PAGE_URL, {
          bookId: bookId,
          moduleValue: _moduleValue,
          bookState: _bookState,
          bookInfoState: _bookInfoState,
          modelId: _conf.modelId
        }, function (html) {
          var layerIndex = layer.index;
          layer.close(layerIndex);
          layer.open({
            title: "添加书页 - 《"+ _conf.initData.name + "》",
            type: 1,
            maxmin: false,
            resize: false,
            area: ['1200px', '800px'],
            scrollbar: false,
            content: html,
            end: function () {
              wantong.base.booklist.search.refreshCurrentPage(_conf.modelId,true);
            },
            cancel: function () {
              $.post(_conf.AUTO_SET_COVER_IMAGE+"?bookId="+bookId,{
                success: function () {
                }
              });
              if (_bookState == 0 || _bookState == 1 || _bookState == 7|| (_bookState==4 && _bookInfoState==0)|| (_bookState==4 && _bookInfoState==1)|| (_bookState==4 && _bookInfoState==7)) {
                _showSaveBookMessageHintFrame(false);
                return false;
              }
              wantong.base.pageAdd.destory();
              wantong.base.booklist.search.refreshEvent();
            }
          });
        });
      },
      //书本编辑也保存后的提示
      _showSaveBookMessageHintFrame = function (isSaveBookMessage) {
        if (_conf.bookId == null || _conf.bookId == -1) {
          layer.closeAll();
          return;
        }
        if (isSaveBookMessage) {
          if (_bookState != 0) {
            layer.msg("保存成功");
            return;
          } else {
            _content = _onlySave + _changeBookStatus;
          }
        } else {
          if (_moduleValue == 10){
            _content = _onlySave + _changeBookStatus;
          } else {
            if (_bookState == 1 || (_bookState==4 && _bookInfoState==1)) {
              _content = _makingSave + _makingNext;
            } else if (_bookState == 7 || (_bookState==4 && _bookInfoState==7)) {
              _content = _examineSave + _examineNext;
            } else {
              _content = _onlySave + _changeBookStatus;
            }
          }

        }
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
          },
          end: function () {
            //wantong.base.booklist.refreshCurrentPage();
          }
        });
      },
      // _setHintSaveFrame = function(){
      //   if(_bookState == 0){
      //     _content = _onlySave + _changeBookStatus;
      //     return
      //   }else {
      //     _content = _onlySave;
      //     return ['300px','120px'];
      //   }
      // },
      // _setHintPageFrame = function(){
      //   _content = _onlySave + _changeBookStatus;
      //   return ['300px', '200px'];
      // },
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
      //在点击保存按钮后续操作
      _afterTheOrderOperation = function (response) {
        if (_conf.examine == "true") {
          console.log('审核');
          layer.confirm('是否进入书页审核？', {}, function (index) {
            _showExaminePageDialog(response.data.bookId);
            layer.close(index);
            _closeBookMessageLayer();
          }, function (index) {
            wantong.base.booklist.refreshCurrentPage();
            layer.close(index);
            _closeBookMessageLayer();
          });
        } else {
          console.log('编辑');
          layer.confirm('是否开始添加书页？',
              {},
              function (index) {
                _showAddPageDialog(response.data.bookId);
                layer.close(index);
                _closeBookMessageLayer();
              }, function (index) {
                wantong.base.booklist.refreshCurrentPage();
                layer.close(index);
                _closeBookMessageLayer();
              });
        }
      },
      _setUpParameters = function () {
        var speaker = _root.find("#speaker");
        _speakerValue = 0;
        var nameValue = _root.find("#name").val();
        var authorValue = _root.find("#author").val();
        var description = _root.find("#description");
        var isbn = _root.find("#isbn").val();
        var publish = _root.find("#publish").val();
        var seriesTitle = _root.find("#seriesTitle").val();
        var innerId = _root.find("#innerId").val();
        var edition = _root.find("#edition").val();
        var isbnContainer = _root.find('#surplusIsbn');
        var sku = _root.find("#skuId").val();
        if (_authorityManagement.upLoadCoverImage) {
          if (_coverImage == null) {
            layer.msg("请上传封面图片");
            return false;
          }else if (_bookState == 1 &&_coverImage.endsWith("temp.jpg")){
            // layer.msg("书本信息页缺少封面，无法移至下个环节");
            // return false;
          }
        }

        if (_authorityManagement.editorBookInformation) {
          if (nameValue == "") {
            layer.msg("请填写书本名称");
            return false;
          }
          var txt = new RegExp(/[<>/|]/);
          if (nameValue.length > 60) {
            layer.msg("书本名称不能超过60个字");
            return false;
          }

          if (publish == "") {
            layer.msg("请填写出版社");
            return false;
          }
          if (txt.test(publish)) {
            layer.msg("出版社不能含有非法字符");
            return false;
          }

          if (authorValue == "") {
            layer.msg("请填写作者名称");
            return false;
          }
          if (authorValue.length > 30) {
            layer.msg("作者名称不能超过30个字");
            return false;
          }
          if (txt.test(authorValue)) {
            layer.msg("作者名称不能含有非法字符");
            return false;
          }

          console.log("innerId:" + innerId);
          var re = /^[0-9]+.?[0-9]*$/;
          if (!re.test(innerId) && innerId != "") {
            //innerId为非数字 表示取自名字-之前的数据未修改
            layer.msg("书本编号必须为纯数字。");
            return false;
          }
          if (innerId.length > 12) {
            layer.msg("书本编号不能大于12位。");
            return false;
          }

          if (isbn == "") {
            layer.msg("请填写isbn");
            return false;
          }
          if (isbn.length != 10 && isbn.length != 13) {
            layer.msg("非法isbn");
            return false;
          }
          if (!_checkIsbnInputsNull()) {
            layer.msg("请输入附属ISBN");
            return false;
          }

          if (!_checkIsbnInputsLen()) {
            layer.msg("请输入合法的ISBN");
            return false;
          }
          if (!_checkIsbnInputsRepeat()) {
            layer.msg("添加的ISBN存在重复，请检查");
            return false;
          }

          if (txt.test(description.val())) {
            layer.msg("书本简介不能含有非法字符");
            return false;
          }
          if (description.val().length > 8000) {
            layer.msg("书本简介长度不能超过8000个字");
            return false;
          }

        }

        var bookId = 0;
        if (_conf.initData) {
          bookId = _conf.bookId;
        }

        var isbns = [];
        isbnContainer.find('.surplus-isbn').each(function() {
          var isbnObj = {
            id: $(this).parent('.surplus-isbn-container').attr('pkval'),
            isbn: $(this).val()
          };

          isbns.push(isbnObj);
        });

        return {
          bookId: bookId,
          modelId: _conf.modelId,
          name: nameValue,
          coverImage: _coverImage,
          author: authorValue,
          description: description.val(),
          isbn: isbn,
          publish: publish,
          seriesTitle: seriesTitle,
          innerId: innerId,
          edition: edition,
          isbns: JSON.stringify(isbns),
          sku: sku
        };
      },
      _initBtnEvent = function () {
        $("body").off("click", "#onlySave .btn").on("click", "#onlySave .btn",
            function () {
              layer.closeAll();
              wantong.base.booklist.search.refreshEvent();
            });

        $("body").off("click", "#changeBookStatus .btn").on("click",
            "#changeBookStatus .btn", function () {
              var _index = layer.index;
              $.get(_conf.SET_BOOK_STATE + "?bookId=" + _conf.bookId + "&state="
                  + _nextState, {}, function (data) {
                if (data.code == 0) {
                  layer.closeAll();
                  wantong.base.booklist.search.refreshEvent();
                  if (wantong.base.pageAdd != undefined) {
                    wantong.base.pageAdd.destory();
                  }
                } else if (data.code == 1 && data.msg == "此模块暂不支持提交到下一环节"){
                  layer.closeAll();
                  wantong.base.booklist.search.refreshEvent();
                  layer.msg(data.msg);
                }
                else {
                  layer.msg(data.msg);
                }
              })
            });
      },
      _checkModuleState = function () {
        if (_bookState == 0 || _bookInfoState == 0) {
          //下个模块为待采样
          _nextState = 1;
        } else if (_bookState == 1 || _bookInfoState == 1) {
          //下个模块为带制作
          _nextState = 7;
        } else if (_bookState == 7 || _bookInfoState == 7) {
          //下个模块为带训练
          _nextState = 4;
        }
        if (_moduleValue == 10){
          //下个模块为带训练
          _nextState = 4;
        }
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
    bindUploaderValidator = function (uploader, picker='a') {
      uploader.on('fileQueued', function (file) {
        let render = new FileReader();
        render.onload = function (e) {
          let image = new Image();
          image.src = String(e.target.result);
          image.onload = function () {
            let flag = validateImage(image.width, image.height, picker);
            if (false === flag){
              _uploader.cancelFile(file);
            }
          };
        };
        render.readAsDataURL(file.source.source);
      });
    };
    validateImage = function (width = 0, height = 0, picker = 'batch', notify = true) {
      /*
       * Sprint8 图片分辨率,比例可配置
       */
      let modelId = Number( document.getElementById('modelId').value );
      let config = JSON.parse( document.getElementById('imageValidationConfig').innerText );
      let sizeConfig = config[`size${modelId}${picker}`];
      let ratioConfig = config[`ratio${modelId}${picker}`];
      console.log(`picker ${picker} 图片尺寸校验配置: sizeConfig[${sizeConfig}], ratioConfig[${ratioConfig}]`);
      if (ratioConfig !== undefined && ratioConfig !== null && ratioConfig !== ''){
        let ratioArray = ratioConfig.split(' ').map(e=> e.split(':').map(e => Number(e)));
        if (undefined === ratioArray.find(e => width / e[0] === height / e[1])){
          if (notify === true){
            layer.msg(`图片比例不符合要求（${ratioConfig.replace(' ',' 或者 ')}）`);
          }
          return false;
        }
      }
      if (sizeConfig !== undefined && sizeConfig !== null && sizeConfig !== ''){
        let [minWidth,minHeight] = sizeConfig.split('x').map(e => Number(e));
        if (width < minWidth || height < minHeight) {
          if (notify === true){
            layer.msg(`图片尺寸不能小于 ${sizeConfig}`);
          }
          return false;
        }
      }
      return true;
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
    showSaveBookMessageHintFrame: function () {
      _showSaveBookMessageHintFrame(false);
    }
  }
})();
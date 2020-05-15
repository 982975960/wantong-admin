wantong.base.pageAdd = (function () {
  var
      _root = null,
      _error = null,
      _examine = null,
      _subManager = {
        pageList: null,
        picManager: null,
        picManager1: null,
        picManager2: null,
        picManager3: null,
        picManager4: null,
        picManager5: null,
        picManager6: null
      },
      _authorityManagement = {
        upLoadPage: false,
        editorPage: false,
        addPage: false
      },
      _pageListPanel = null,
      _thisLayerIndex = 0,
      _partnerId = 0,
      _moduleValue = 0,
      _conf = {
        pageId: -1,
        bookExamine: false,
        initData: {},
        initData1: {},
        initData2: {},
        initData3: {},
        initData4: {},
        initData5: {},
        initData6: {},
        examine: false,
        bookState: 0,
        bookInfoState: 0,
        origin: 0,
        LOAD_PAGE_INFO: "base/loadPageInfo.do",
        SAVE_PAGE_INFO: "base/savePageInfo.do",
        ADD_PAGE_URL: "base/showAddPage.do",
        TEST_RECOGNIZE_URL: "base/recognize.do",
        CHANGE_EXAMINE_URL: "base/changePageExamine.do",
        FINGER_IMAGE_URL: "base/fingerBook.do",
        LOAD_PAGE_NY_CONTENT: "base/loadPageNyContent.do",
        SIMILAR_BOOK_BY_COVER: "base/similarBookByCover.do"
      },
      _init = function (conf) {
        $.extend(_conf, conf);

        let config = JSON.parse(
            document.getElementById('imageValidationConfig').innerText );
        let sizeConfig = config[`size${conf.modelId}batch`];
        document.getElementById('imageHelpContent_imageLimitation')
            .innerText = `jpg格式、分辨率为${sizeConfig}`;

        console.log("pageAdd");
        _root = $("#pageAdd");
        _error = _root.find("#error");
        _error.hide();
        _partnerId = conf.partnerId;
        _examine = conf.examine;

        //获得在那个模块
        _moduleValue = conf.moduleValue;

        _thisLayerIndex = layer.index;
        wantong.base.pageAdd.batchImage.init(_conf);

        _subManager.pageList = wantong.base.pageAdd.pageList;
        _subManager.pageList.init({
          rootNode: _root.find("#pageListContainer"),
          examine: _conf.bookExamine,
          bookState: _conf.bookState,
          bookInfoState: _conf.bookInfoState,
          origin: _conf.origin
        });

        _subManager.picManager = wantong.base.pageAdd.picManager;
        _subManager.picManager.init({
          rootNode: _root.find("#image1"),
          initData: _conf.initData
        });
        _subManager.picManager1 = wantong.base.pageAdd.picManager2;
        _subManager.picManager1.init({
          rootNode: _root.find("#image2"),
          initData: _conf.initData1
        });
        _subManager.picManager2 = wantong.base.pageAdd.picManager3;
        _subManager.picManager2.init({
          rootNode: _root.find("#image3"),
          initData: _conf.initData2
        });
        _subManager.picManager3 = wantong.base.pageAdd.picManager4;
        _subManager.picManager3.init({
          rootNode: _root.find("#image4"),
          initData: _conf.initData3
        });
        _subManager.picManager4 = wantong.base.pageAdd.picManager5;
        _subManager.picManager4.init({
          rootNode: _root.find("#image5"),
          initData: _conf.initData4
        });
        _subManager.picManager5 = wantong.base.pageAdd.picManager6;
        _subManager.picManager5.init({
          rootNode: _root.find("#image6"),
          initData: _conf.initData5
        });
        _subManager.picManager6 = wantong.base.pageAdd.picManager7;
        _subManager.picManager6.init({
          rootNode: _root.find("#image7"),
          initData: _conf.initData6
        });
        _lister();

        _pageListPanel = _root.find("#pageList");
        _root.find("#bookEdit").on('mousewheel', function () {
          return false;
        });
        //获得该用户当前的权限
        _initPageAuthority();

        _initPaginationPanel();
        _initPageListPanelToolbar();
        _initSaveAndNextButton();
        _initExamineBtn();
        _initFingerBtn();
        if (conf.bookId) {
          _subManager.pageList.refresh(conf.bookId);
        }

      },
      _initExamineControl = function () {
        var examine = _conf.initData.examine;
        var bookExamine = _conf.bookExamine;
        console.log("examine page" + examine + " bookExamine" + bookExamine);
        if (bookExamine) {
          //属于审核页
          _conf.examine = true;
          _root.find("#examineBtn").css("display", "inline");
          _setCheckBtnState(examine == 0 ? true : false);
        } else {
          _root.find("#examineBtn").css("display", "none");
        }
        var examineDiv = _root.find("#examineDiv");
        if (_conf.examine) {
          var $tip = _root.find("#examineTip");
          if (examine == 2) {
            $tip.text(_conf.initData.examineReason);
            examineDiv.css("display", "inline");
          } else {
            $tip.text("");
          }
        } else {
          var $tip = _root.find("#examineTip");
          $tip.text("");
          examineDiv.css("display", "none");
        }

      },
      _initExamineBtn = function () {
        _root.find('#examineSuccessBtn').on('click', function () {
          //变更当前你书页状态为审核通过
          _setPicExamine(_conf.pageId, 1, '', function () {
            //刷新列表
            var bookId = $("#pageItem").attr("bookId");
            wantong.base.pageAdd.pageList.refresh(bookId, function () {
              //刷新编辑页
              _loadPageData(_conf.pageId);
              _setCheckBtnState(false);
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
                wantong.base.pageAdd.pageList.refresh(bookId, function () {
                  //刷新编辑页
                  _loadPageData(_conf.pageId);
                  _setCheckBtnState(false);
                });
              });
              layer.close(index);
            }
          })
        });
      },
      _initFingerBtn = function () {
        _root.find("#fingerBtn").click(function () {
          _root.find("#fingerBtn").blur();
          console.log("imageId:" + _conf.initData.imageId);
          if (_conf.pageId == null || _conf.pageId == 0 || _conf.pageId == -1) {
            layer.msg("请先上传并保存图片。");
            return;
          }
          $.get(_conf.FINGER_IMAGE_URL, {},
              function (data) {
                layer.open({
                  title: "标定书本",
                  type: 1,
                  maxmin: false,
                  area: ['100%', '100%'],
                  content: data,
                  success: function () {
                    wantong.base.fingerBook.init({
                      bookId: _conf.bookId,
                      imageId: _conf.initData.imageId,
                      pageId: _conf.initData.id,
                      modelId: _conf.initData.modelId,
                      position: _conf.initData.position
                    });
                  },
                  end: function () {
                    var bookId = $("#pageItem").attr("bookId");
                    wantong.base.pageAdd.pageList.refresh(bookId, function () {
                      //刷新编辑页
                      _loadPageData(_conf.pageId);
                    });
                  }
                });

              });
        });
      },
      //获得角色在当前模块的权限
      _initPageAuthority = function () {
        //JSON.parse将拿到的字符串"false"转为boolen
        _authorityManagement.upLoadPage = JSON.parse(
            $("#phyPage").attr("isAuthority"));  //有这个权限 可以添加、插入书页，编辑物理页面及物理页状态
        _authorityManagement.editorPage = JSON.parse(
            $(".form-group #pagination").attr("isAuthority"));//包括语音、背景音乐、音效的编辑、书页类型及页码的编辑
        _authorityManagement.addPage = JSON.parse(
            $("#addNewPageBtn").attr("isAuthority"));
      },
      _setPicExamine = function (pageId, examine, examineReason,
          successCallback) {
        //1审核通过 2审核不通过
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
        $('#pageListContainer .page-thumbnail-container .active').removeClass(
            'active');
        $('#pageListContainer div[pageid="' + pageId
            + '"] .page-thumbnail-container img').addClass('active');

        $('#pageListContainer .page-thumbnail-container .mouseHover').removeClass(
            'mouseHover');

        console.log('chose');
        $.ajax({
          url: _conf.LOAD_PAGE_INFO,
          type: "GET",
          async: false,
          contentType: "application/json",
          data: {
            pageId: pageId
          },
          dataType: 'json',
          success: function (data) {
            console.log("load");
            if (data.code == 0) {

              _renewAll();
              _conf.pageId = pageId;
              _root.find("#graphicRecognition").prop("checked",
                  data.data[0].recType == 0 ? false : true);
              _conf.initData = null;
              _conf.initData1 = null;
              _conf.initData2 = null;
              _conf.initData3 = null;
              _conf.initData4 = null;
              _conf.initData5 = null;
              _conf.initData6 = null;
              for (var i = 0; i < 7; i++) {
                if (data.data[i] != null && data.data[i].imageType != null) {
                  switch (data.data[i].imageType) {
                    case 0:
                      _conf.initData = data.data[i];
                      _subManager.picManager.loadData(data.data[i]);
                      break;
                    case 1:
                      _subManager.picManager1.loadData(data.data[i]);
                      _conf.initData1 = data.data[i];
                      break;
                    case 2:
                      _subManager.picManager2.loadData(data.data[i]);
                      _conf.initData2 = data.data[i];
                      break;
                    case 3:
                      _subManager.picManager3.loadData(data.data[i]);
                      _conf.initData3 = data.data[i];
                      break;
                    case 4:
                      _subManager.picManager4.loadData(data.data[i]);
                      _conf.initData4 = data.data[i];
                      break;
                    case 5:
                      _subManager.picManager5.loadData(data.data[i]);
                      _conf.initData5 = data.data[i];
                      break;
                    case 6:
                      _subManager.picManager6.loadData(data.data[i]);
                      _conf.initData6 = data.data[i];
                      break;
                  }
                }
              }
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

        _root.find("#pageType").val(pageType);
        _root.find("#pagination").val(pagination);
        _root.find("#phyPage").val(phyPage);
        _root.find("#phyState").val(phyState);
      },
      _initSaveAndNextButton = function () {
        $("#saveAndNextButton").on("click", function () {
          $(this).blur();
          $.post();

          var value = $(document.activeElement).val()
          if (isNaN(value)) {
            return;
          }
          var pageType = _root.find("#pageType").val();
          if (pageType == 1){
            var picData = _subManager.picManager.getData();
            if (picData.imageName == null) {
              layer.msg("请上传斜视跨页--中缝居中的图片");
              return;
            }
            _similarBookByCover (picData.imageName,_conf.bookId,0);
          }else {
            _continueSavePage();
          }
        });
        $("#showContent").on("click", function () {
          $(this).blur();
          _showPageNyContent();
        });

      },
      _continueSavePage = function () {
        if (_conf.bookState == 0) {
          _SavePageInCreateState();
        } else if (_conf.bookState == 1) {
          _SavePageInSamplingState();
        } else {
          _SavePageInEditorState();
        }
      },
      _similarBookByCover = function (fileName,bookId,type){
      $.post(_conf.SIMILAR_BOOK_BY_COVER,{
        fileName: fileName,
        bookId: bookId,
        type: type,
        modelId: $("#modelId").val()
      },function (response) {
        if (response.code > 0){
          //新增type=0提示继续新增一页，批量type=1不提示
          if (type == 0){
            _continueSavePage();
          }
        }else {
          var similarIndex = layer.open({
            title: "提醒",
            type: 1,
            maxmin: false,
            move: false,
            resize: false,
            area: ['690px', '280px'],
            content: response,
            success: function (layero) {
              var dom = $(layero);
              dom.find("#confirmBtn").click(function (data) {
                layer.close(similarIndex);
                if (type == 0){
                  _continueSavePage();
                }
              });
            },
            cancel: function () {
              if (type == 0){
                _continueSavePage();
              }
            }
          });
        }
      });
    },
      _SavePageInCreateState = function () {
        //有编辑书页的权限 包括语音、背景音乐、音效的编辑、书页类型及页码的编辑
        var recType = _root.find("#graphicRecognition").get(0).checked ? 1
            : 0;
        var pageType = _root.find("#pageType").val();
        var pagination = _root.find("#pagination").val();
        var picData = _subManager.picManager.getData();
        var picData1 = _subManager.picManager1.getData();
        var picData2 = _subManager.picManager2.getData();
        var picData3 = _subManager.picManager3.getData();
        var picData4 = _subManager.picManager4.getData();
        var picData5 = _subManager.picManager5.getData();
        var picData6 = _subManager.picManager6.getData();
        var physicalState = _root.find("#phyState").val();
        var physicalIndex = _root.find("#phyPage").val();
        if (_authorityManagement.upLoadPage) {
          if (picData.imageName == null) {
            layer.msg("请上传斜视跨页--中缝居中的图片");
            return;
          }
          if (physicalIndex == '') {
            layer.msg("请填写当前物理页码");
            return;
          }
          if (physicalState == '') {
            physicalState = 0;
          }
        }

        if (_authorityManagement.editorPage) {
          if (pageType == 0 || pagination == '') {
            layer.msg("请输入书页类型及页码");
            return;
          }
          if (pagination == 0) {
            layer.msg("当前页码不能为0");
            return;
          }
        }
        var data = {
          id: _conf.pageId,
          baseBookId: _conf.bookId,
          modelId: _conf.modelId,
          pageType: pageType,
          pagination: pagination,
          physicalIndex: physicalIndex,
          physicalState: physicalState,
          coverImage: picData,
          imageType: 0,
          recType: recType
        };
        console.log("datadata");
        var allData = new Array();
        allData.push(data);
        var data1 = null;
        if (picData1 != null && picData1.imageName != null
            && picData1.imageName != "") {
          data1 = {
            id: _conf.pageId,
            baseBookId: _conf.bookId,
            modelId: _conf.modelId,
            pageType: pageType,
            pagination: pagination,
            physicalIndex: physicalIndex,
            physicalState: physicalState,
            coverImage: picData1,
            imageType: 1,
            recType: recType
          };
          allData.push(data1);
        }
        var data2 = null;
        if (picData2 != null && picData2.imageName != null
            && picData2.imageName != "") {
          data2 = {
            id: _conf.pageId,
            baseBookId: _conf.bookId,
            modelId: _conf.modelId,
            pageType: pageType,
            pagination: pagination,
            physicalIndex: physicalIndex,
            physicalState: physicalState,
            coverImage: picData2,
            imageType: 2,
            recType: recType
          };
          allData.push(data2);
        }
        var data3 = null;
        if (picData3 != null && picData3.imageName != null
            && picData3.imageName != "") {
          data3 = {
            id: _conf.pageId,
            baseBookId: _conf.bookId,
            modelId: _conf.modelId,
            pageType: pageType,
            pagination: pagination,
            physicalIndex: physicalIndex,
            physicalState: physicalState,
            coverImage: picData3,
            imageType: 3,
            recType: recType
          };
          allData.push(data3);
        }
        var data4 = null;
        if (picData4 != null && picData4.imageName != null
            && picData4.imageName != "") {
          data4 = {
            id: _conf.pageId,
            baseBookId: _conf.bookId,
            modelId: _conf.modelId,
            pageType: pageType,
            pagination: pagination,
            physicalIndex: physicalIndex,
            physicalState: physicalState,
            coverImage: picData4,
            imageType: 4,
            recType: recType
          };
          allData.push(data4);
        }
        var data5 = null;
        if (picData5 != null && picData5.imageName != null
            && picData5.imageName != "") {
          data5 = {
            id: _conf.pageId,
            baseBookId: _conf.bookId,
            modelId: _conf.modelId,
            pageType: pageType,
            pagination: pagination,
            physicalIndex: physicalIndex,
            physicalState: physicalState,
            coverImage: picData5,
            imageType: 5,
            recType: recType
          };
          allData.push(data5);
        }
        var data6 = null;
        if (picData6 != null && picData6.imageName != null
            && picData6.imageName != "") {
          data6 = {
            id: _conf.pageId,
            baseBookId: _conf.bookId,
            modelId: _conf.modelId,
            pageType: pageType,
            pagination: pagination,
            physicalIndex: physicalIndex,
            physicalState: physicalState,
            coverImage: picData6,
            imageType: 6,
            recType: recType
          };
          allData.push(data6);
        }
        _savePageInfo(allData);
      },
      _SavePageInSamplingState = function () {
        var recType = _root.find("#graphicRecognition").get(0).checked ? 1
            : 0;
        var pageType = _root.find("#pageType").val();
        var pagination = _root.find("#pagination").val();
        var picData = _subManager.picManager.getData();
        var picData1 = _subManager.picManager1.getData();
        var picData2 = _subManager.picManager2.getData();
        var picData3 = _subManager.picManager3.getData();
        var picData4 = _subManager.picManager4.getData();
        var picData5 = _subManager.picManager5.getData();
        var picData6 = _subManager.picManager6.getData();
        var physicalState = _root.find("#phyState").val();
        var physicalIndex = _root.find("#phyPage").val();
        if (picData.imageName == null) {
          layer.msg("请上传斜视跨页-中缝居中的图片");
          return;
        }
        if (physicalIndex == '') {
          layer.msg("‘请输入物理页码’");
          return;
        }
        if (physicalState == '') {
          physicalState = 0;
        }
        if (_authorityManagement.editorPage) {
          if (pageType == 0 || pagination == '') {
            layer.msg("请输入书页类型及页码");
            return;
          }
          if (pagination == 0) {
            layer.msg("当前页码不能为0");
            return;
          }

        }

        var data = {
          id: _conf.pageId,
          baseBookId: _conf.bookId,
          modelId: _conf.modelId,
          pageType: pageType,
          pagination: pagination,
          physicalIndex: physicalIndex,
          physicalState: physicalState,
          coverImage: picData,
          imageType: 0,
          recType: recType
        }
        var allData = new Array();
        allData.push(data);
        var data1 = null;
        if (picData1 != null && picData1.imageName != null
            && picData1.imageName != "") {
          data1 = {
            id: _conf.pageId,
            baseBookId: _conf.bookId,
            modelId: _conf.modelId,
            pageType: pageType,
            pagination: pagination,
            physicalIndex: physicalIndex,
            physicalState: physicalState,
            coverImage: picData1,
            imageType: 1,
            recType: recType
          };
          allData.push(data1);
        }
        var data2 = null;
        if (picData2 != null && picData2.imageName != null
            && picData2.imageName != "") {
          data2 = {
            id: _conf.pageId,
            baseBookId: _conf.bookId,
            modelId: _conf.modelId,
            pageType: pageType,
            pagination: pagination,
            physicalIndex: physicalIndex,
            physicalState: physicalState,
            coverImage: picData2,
            imageType: 2,
            recType: recType
          };
          allData.push(data2);
        }
        var data3 = null;
        if (picData3 != null && picData3.imageName != null
            && picData3.imageName != "") {
          data3 = {
            id: _conf.pageId,
            baseBookId: _conf.bookId,
            modelId: _conf.modelId,
            pageType: pageType,
            pagination: pagination,
            physicalIndex: physicalIndex,
            physicalState: physicalState,
            coverImage: picData3,
            imageType: 3,
            recType: recType
          };
          allData.push(data3);
        }
        var data4 = null;
        if (picData4 != null && picData4.imageName != null
            && picData4.imageName != "") {
          data4 = {
            id: _conf.pageId,
            baseBookId: _conf.bookId,
            modelId: _conf.modelId,
            pageType: pageType,
            pagination: pagination,
            physicalIndex: physicalIndex,
            physicalState: physicalState,
            coverImage: picData4,
            imageType: 4,
            recType: recType
          };
          allData.push(data4);
        }
        var data5 = null;
        if (picData5 != null && picData5.imageName != null
            && picData5.imageName != "") {
          data5 = {
            id: _conf.pageId,
            baseBookId: _conf.bookId,
            modelId: _conf.modelId,
            pageType: pageType,
            pagination: pagination,
            physicalIndex: physicalIndex,
            physicalState: physicalState,
            coverImage: picData5,
            imageType: 5,
            recType: recType
          };
          allData.push(data5);
        }
        var data6 = null;
        if (picData6 != null && picData6.imageName != null
            && picData6.imageName != "") {
          data6 = {
            id: _conf.pageId,
            baseBookId: _conf.bookId,
            modelId: _conf.modelId,
            pageType: pageType,
            pagination: pagination,
            physicalIndex: physicalIndex,
            physicalState: physicalState,
            coverImage: picData6,
            imageType: 6,
            recType: recType
          };
          allData.push(data6);
        }
        _savePageInfo(allData);

      },
      _SavePageInEditorState = function () {
        var recType = _root.find("#graphicRecognition").get(0).checked ? 1
            : 0;
        var pageType = _root.find("#pageType").val();
        var pagination = _root.find("#pagination").val();
        var picData = _subManager.picManager.getData();
        var picData1 = _subManager.picManager1.getData();
        var picData2 = _subManager.picManager2.getData();
        var picData3 = _subManager.picManager3.getData();
        var picData4 = _subManager.picManager4.getData();
        var picData5 = _subManager.picManager5.getData();
        var picData6 = _subManager.picManager6.getData();
        var physicalState = _root.find("#phyState").val();
        var physicalIndex = _root.find("#phyPage").val();
        if (_authorityManagement.upLoadPage) {
          if (picData.imageName == null) {
            layer.msg("请上传斜视跨页-中缝居中的图片");
            return;
          }
          if (physicalIndex == '') {
            layer.msg("请输入物理页码");
            return;
          }

          if (physicalState == '') {
            physicalState = 0;
          }
        }

        if (pageType == 0 || pagination == '') {
          layer.msg("请输入书页类型及页码");
          return;
        }
        if (pagination == 0) {
          layer.msg("当前页码不能为0");
          return;
        }

        var data = {
          id: _conf.pageId,
          baseBookId: _conf.bookId,
          modelId: _conf.modelId,
          pageType: pageType,
          pagination: pagination,
          physicalIndex: physicalIndex,
          physicalState: physicalState,
          coverImage: picData,
          imageType: 0,
          recType: recType
        }
        var allData = new Array();
        allData.push(data);
        var data1 = null;
        if (picData1 != null && picData1.imageName != null
            && picData1.imageName != "") {
          data1 = {
            id: _conf.pageId,
            baseBookId: _conf.bookId,
            modelId: _conf.modelId,
            pageType: pageType,
            pagination: pagination,
            physicalIndex: physicalIndex,
            physicalState: physicalState,
            coverImage: picData1,
            imageType: 1,
            recType: recType
          };
          allData.push(data1);
        }
        var data2 = null;
        if (picData2 != null && picData2.imageName != null
            && picData2.imageName != "") {
          data2 = {
            id: _conf.pageId,
            baseBookId: _conf.bookId,
            modelId: _conf.modelId,
            pageType: pageType,
            pagination: pagination,
            physicalIndex: physicalIndex,
            physicalState: physicalState,
            coverImage: picData2,
            imageType: 2,
            recType: recType
          };
          allData.push(data2);
        }
        var data3 = null;
        if (picData3 != null && picData3.imageName != null
            && picData3.imageName != "") {
          data3 = {
            id: _conf.pageId,
            baseBookId: _conf.bookId,
            modelId: _conf.modelId,
            pageType: pageType,
            pagination: pagination,
            physicalIndex: physicalIndex,
            physicalState: physicalState,
            coverImage: picData3,
            imageType: 3,
            recType: recType
          };
          allData.push(data3);
        }
        var data4 = null;
        if (picData4 != null && picData4.imageName != null
            && picData4.imageName != "") {
          data4 = {
            id: _conf.pageId,
            baseBookId: _conf.bookId,
            modelId: _conf.modelId,
            pageType: pageType,
            pagination: pagination,
            physicalIndex: physicalIndex,
            physicalState: physicalState,
            coverImage: picData4,
            imageType: 4,
            recType: recType
          };
          allData.push(data4);
        }
        var data5 = null;
        if (picData5 != null && picData5.imageName != null
            && picData5.imageName != "") {
          data5 = {
            id: _conf.pageId,
            baseBookId: _conf.bookId,
            modelId: _conf.modelId,
            pageType: pageType,
            pagination: pagination,
            physicalIndex: physicalIndex,
            physicalState: physicalState,
            coverImage: picData5,
            imageType: 5,
            recType: recType
          };
          allData.push(data5);
        }
        var data6 = null;
        if (picData6 != null && picData6.imageName != null
            && picData6.imageName != "") {
          data6 = {
            id: _conf.pageId,
            baseBookId: _conf.bookId,
            modelId: _conf.modelId,
            pageType: pageType,
            pagination: pagination,
            physicalIndex: physicalIndex,
            physicalState: physicalState,
            coverImage: picData6,
            imageType: 6,
            recType: recType
          };
          allData.push(data6);
        }
        _savePageInfo(allData);
      },
      _SavePageInOtherState = function () {

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
              if (_conf.examine) {
                //属于审核 变更审核状态为0
                _setPicExamine(data.data.pageId, 0, '', function () {
                  //刷新列表
                  _subManager.pageList.refresh(_conf.bookId, function () {
                    //刷新编辑页
                    //_loadPageData(_conf.pageId);
                    layer.msg("保存成功", {time: 3000});
                    _loadPageData(data.data.pageId);
                    _setSaveNextButtonState(false);
                  });
                });
              } else {
                _subManager.pageList.refresh(_conf.bookId, null, function () {
                  _loadPageData(data.data.pageId);
                  _setSaveNextButtonState(false);
                });
                //判断有没有添加书页的权限
                if (_authorityManagement.addPage && _conf.origin == 0) {
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
                      wantong.base.pageAdd.pageList.renderEditing();
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
              if (data.code == 1 && data.msg == "此书页类型页码已存在") {
                layer.msg(data.msg);
              } else if(data.code == 1 && data.msg == "训练任务正在进行，不能更新书页") {
                layer.msg(data.msg);
              }else {
                layer.msg("保存绘本书页数据失败");
              }

            }
          },
          error: function () {
            layer.msg("服务无响应");
          }
        }).always(function () {
          saveBtn.html(btnTxt).attr('disabled', false);
        });
      },
      _calcNextPhyPage = function (nextPhy) {
        if (nextPhy) {
          return nextPhy;
        }
        return 0;
      },
      _renewAll = function (nextPhy) {
        _root.find("#pageType").val(0);
        _root.find("#pagination").val(0);
        _root.find("#phyPage").val(_calcNextPhyPage(nextPhy));
        _root.find("#phyState").val(0);
        _root.find("#graphicRecognition").prop("checked", false);
        _subManager.picManager.renewAll();
        _subManager.picManager1.renewAll();
        _subManager.picManager2.renewAll();
        _subManager.picManager3.renewAll();
        _subManager.picManager4.renewAll();
        _subManager.picManager5.renewAll();
        _subManager.picManager6.renewAll();
        _conf.pageId = 0;
        wantong.base.pageAdd.pageList.clearEditing();
        _root.find("#examineDiv").css("display", "none");
        // _root.find("#startExamine").css('display', 'none');
        // _root.find("#saveAndNextButton").css('display', 'inline');
      },
      _initPageListPanelToolbar = function () {
        var btn = _root.find("#togglePageListPanelBtn");
        var _bookEdit = _root.find("#bookEdit");
        btn.click(function () {
          var span = btn.find("span");
          var addNewBtn = $('#addNewPageBtn');
          let batchImage = $("#batchImageItem");
          var targetHeight = 0;
          if (span.hasClass("glyphicon-chevron-left")) {
            _pageListPanel.animate({
              width: '0px',
            }, 500, function () {
              addNewBtn.css('display', 'none');
              span.removeClass("glyphicon-chevron-left");
              span.addClass("glyphicon-chevron-right");
              if (batchImage.length > 0) {
                batchImage.css('display', 'none');
              }
            });
            _bookEdit.animate({
              width: '97%',
            }, 700, function () {
            });
          } else {
            _pageListPanel.animate({
              width: '200px',
            }, 500, function () {
              if (_authorityManagement.addPage) {
                addNewBtn.css('display', 'block');
              }
              if (batchImage.length > 0) {
                batchImage.css('display', 'inline-block');
              }
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
        var picManager = all.find("#picManager");
        var uploadBtn1 = picManager.find("#image1").find("#uploadButton");
        var uploadBtn2 = picManager.find("#image2").find("#uploadButton");
        var uploadBtn3 = picManager.find("#image3").find("#uploadButton");
        var uploadBtn4 = picManager.find("#image4").find("#uploadButton");
        var uploadBtn5 = picManager.find("#image5").find("#uploadButton");
        var uploadBtn6 = picManager.find("#image6").find("#uploadButton");

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
        uploadBtn1.on('click', function () {
          _setSaveNextButtonState(true);
          _root.find("#examineSuccessBtn").attr("disabled", "true");
          _root.find("#examineFailBtn").attr("disabled", "true");
        });
        uploadBtn2.on('click', function () {
          _setSaveNextButtonState(true);
          _root.find("#examineSuccessBtn").attr("disabled", "true");
          _root.find("#examineFailBtn").attr("disabled", "true");
        });
        uploadBtn3.on('click', function () {
          _setSaveNextButtonState(true);
          _root.find("#examineSuccessBtn").attr("disabled", "true");
          _root.find("#examineFailBtn").attr("disabled", "true");
        });
        uploadBtn4.on('click', function () {
          _setSaveNextButtonState(true);
          _root.find("#examineSuccessBtn").attr("disabled", "true");
          _root.find("#examineFailBtn").attr("disabled", "true");
        });
        uploadBtn5.on('click', function () {
          _setSaveNextButtonState(true);
          _root.find("#examineSuccessBtn").attr("disabled", "true");
          _root.find("#examineFailBtn").attr("disabled", "true");
        });
        uploadBtn6.on('click', function () {
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
      _setCheckBtnState = function (state) {
        if (state) {
          $("#examineSuccessBtn").removeAttr("disabled");
          $("#examineFailBtn").removeAttr("disabled");
        } else {
          $("#examineSuccessBtn").attr("disabled", "disabled");
          $("#examineFailBtn").attr("disabled", "disabled");
        }
      },
      _showPageNyContent = function () {
        if (_conf.pageId == -1) {
          layer.msg("暂无书页信息。");
          return;
        }
        $.get(_conf.LOAD_PAGE_NY_CONTENT + "?pageId=" + _conf.pageId,
            {},
            function (data) {
              if (data.data != null) {
                layer.alert(data.data,{title:'内容'});
              }
            });
      }
  ;

  return {
    init: function (conf) {
      _init(conf);
    },
    loadPageData: function (pageId) {
      _loadPageData(pageId);
    },
    linsterUndate: function () {
      _listerUndate();
    },
    renewAll: function (nextPhy) {
      console.log('renew');
      _renewAll(nextPhy);
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
    setCheckBtnState: function (state) {
      _setCheckBtnState(state);
    },
    similarBookByCover: function (bookId,type) {
      _similarBookByCover("", bookId,type);
    }
  }
})();



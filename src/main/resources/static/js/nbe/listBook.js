wantong.nbeListBook = (function () {
  var _root = null,
      BOOK_PUBLISH_STATE = "3",
      REPO_MAKE_STATE = "0",
      REPO_CHECK_STATE = "7",
      REPO_PUBLISH_STATE = "3,11",
      REPO_ALL_STATE = "0,3,7,11",
      nbeRepoId = null,
      _bookState = null,
      _currentTab = null,
      _currentPage = 0,
      _layerIndex = null,
      _forbidden = 0,
      _module = 0,//0是其他状态 1是领书状态 2是搜索模块
      //是否是领书
      _ref = false,
      _isClickSearch = false,
      _partnerId = 0,
      _uploader = null,
      _indexk12 = null,
      viewModel = null,
      _selectLabelIndex = null,
      //搜索的对象
      parameter = {
        modelId: 0,
        module: 0,
        currentPage: 0,
        isRef: false,
        status: status,
        beginTime:"",
        endTime:"",
        forbidden: 0,
        pageSize: 0,
        stateArray:null,
        _searchContent : {
          bookName: "",
          isbn: "",
          press: "",
          dubble: "",
          edition: "",
          bookNumber: "",
          bookId: "",
          labelName: "",
          labelIds: null
        }
      },
      _conf = {
        URL_LIST_BOOK: "cms/listBooks.do",
        FORBIDDEN_BOOK_URL: "cms/forbiddenBook.do",
        URL_DELETE_BOOK: "cms/deleteBookRepo.do?bookId={id}",
        RECEIVE_BOOK_URL: "cms/pickUpBooks.do",
        addBookPage: "cms/showAddBookPage.do",
        URL_PACKUP: "cms/packUp.do",
        UPLOAD_URL: "cms/zipUpload.do",
        UPLOAD_CONFIRM: "cms/uploadConfirm.do",
        UPLOAD_BIG_FILE: "/cms/uploadBigfile.do",
        LIST_RECORD_STATE_URL:"/cms/listRecordBooks.do",
        LIST_BOOK_CHANGE_RECORD_URL:"/cms/getBookChangeRecord.do",
        CHANGE_RECORD_STATE_URL:"/cms/changeRecordBookState.do",
        LABEL_INFO_URL: "/cms/addLabel.do",
        EXPORT_URL:"/cms/booksExport.do",
        SHOW_QRCODE_URL:"/cms/showQrcode.do"
      },
      //领书模块的提示
      _refHint = null,
      _init = function (activeIndex,repoId) {
        //$.extend(_conf,conf);
        console.log("resouList");
        _root = $("#bookList");
        _refHint = _root.find(".ref-module-hint");
        _partnerId = _root.find("#searchTerms").attr("partnerId");
        nbeRepoId = repoId;
        _initModuleBookList();
        _initResourcePoolSelector();
        _initTab(activeIndex);
        _loadComponent();
        _initButtons();
        _initStateSelect();
        _initLabelSelect();
      },
      //初始化 状态选择事件
      _initStateSelect = function() {
        _root.off("click", "#stateSelector").on("click",
            "#stateSelector", function (eve) {
              $(".laydate-theme-molv").remove();
              eve.stopPropagation();
            });
        _root.off("click", "#stateSelector .mr-selector").on("click",
            "#stateSelector .mr-selector", function (eve) {
              $("#stateSelector .select").toggle();
            });
        _root.off("click", "#stateSelector .img-selector").on("click",
            "#stateSelector .img-selector", function (eve) {
              $("#stateSelector .select").toggle();
            });
        _root.off("click", "#stateSureBtn").on("click",
            "#stateSureBtn", function () {
              _selectStrDisplay();
              $("#stateSelector .select").hide();
            });
        $("body").click(function () {
          $("#stateSelector .select").hide();
        });

      },

      _selectStrDisplay = function () {
        var _selectStr = '';
        var selectDom = _root.find("#stateSelector :checked");
        var stateTextDom = _root.find("#stateSelector").find("input[name='text']");
        let stateText = "";
        if (selectDom.length > 3) {
          _selectStr = selectDom.eq(0).val() + '、' + selectDom.eq(1).val() + '、' + selectDom.eq(2).val() + '...';
        } else if (selectDom.length == 3) {
          _selectStr = selectDom.eq(0).val() + '、' + selectDom.eq(1).val() + '、' + selectDom.eq(2).val();
        } else if (selectDom.length == 2) {
          _selectStr = selectDom.eq(0).val() + '、' + selectDom.eq(1).val();
        } else if (selectDom.length == 1) {
          _selectStr = selectDom.eq(0).val();
        } else {
          _selectStr = '选择状态';
        }
        selectDom.each(function(){
          if(stateText == "") {
            stateText = $(this).attr("state");
          }else {
            stateText = stateText+"," + $(this).attr("state");
          }
        });
        stateTextDom.val(stateText);
        _root.find("#stateSelector .mr-selector").html(_selectStr);
      },

      //初始化标签选择或者输入
      _initLabelSelect = function () {
        $(".search-all #label-name-select").off("click").on("click",function () {
          let idsSting = $(".search-all").find("input[name='ids']").val();
          $.get(_conf.LABEL_INFO_URL, {
            isMakePic:false,
            isSearch:true,
          }, function (data) {
            let content = data;
            _openLabelPanel(content,idsSting);
          });
        });
      },

      _openLabelPanel = function(content,ids) {
        _selectLabelIndex = layer.open({
          type:1,
          title:false,
          scrollbar:false,
          area: ['830px','800px'],
          content:content,
          closeBtn:false,
          success : function() {
            wantong.cms.searchLabel.initChecked(ids);
          }
        });
      },
      /**
       * 关闭选择标签的方法
       * @param ids 选择标签的Id集合
       * @param labelNames 选择标签的名称集合
       * @param labelName 输入的标签名称
       * @private
       */
      _labelLayerClose = function(ids,labelNames,labelName){
        if(ids == undefined && labelName == undefined && labelNames == undefined){
          layer.close(_selectLabelIndex);
          return;
        }
        if(""==labelName){
          $("#label-name-select").val(labelNames);
          $("input[name='ids']").val(ids);
        } else {
          $("#label-name-select").val(labelName);
          $("input[name='ids']").val("");
        }
        layer.close(_selectLabelIndex);
      },

      // _checkNoRepo = function () {
      //   var size = $("select#modelId").children().size();
      //   if (size == 0) {
      //     layer.open({
      //       title: "提示",
      //       content: "您还未创建资源库，请先在“资源库管理下”，点击创建资源库按钮，创建资源库，再进行资源制作。"
      //     });
      //   }
      // },

      _initModuleBookList = function () {
        //领书模块
        _root.referenceBookList = $("#referenceBookList");
        //书本资源编辑
        _root.nbeBookList = $("#nbeBookList");

        _root.bookName = $("#bookName");
        _root.isbn = $("#isbn");
        _root.press = $("#press");
        _root.dubble = $("#dubble");
        _root.edition = $("#edition");
        _root.bookNumber = $("#bookNumber");
        _root.bookId = $("#bookId");
        _root.labelName = $("#label-name");
        _root.beginTime = $("#beginTime") ;
        _root.endTime = $("#endTime");
        _root.searchAllLabelIds = $("input[name='ids']");
        _root.searchLabels =  $("#label-name-select");
        _root.states =  $("#stateSelector").find("input[name='text']");
        _root.stateName = $("#stateSelector .mr-selector");
      },
      //选择资源库
      _initResourcePoolSelector = function () {
        _root.find("#modelId").change(function () {
          // var modelId = _root.find("#modelId").val();
          // 若不是图片更新记录的模块
          if(_currentTab != _root.pictureUpdateRecordList) {
            _clearSearch(true);
            _refreshList(1, true);
          } else {
            //  否则去刷新图片更新
            _refreshPictureUpdateList();
          }
        });
      },

      _loadComponent = function () {
        layui.use(['laydate', 'form'], function () {
          var laydate = layui.laydate,
              layer = layui.layer;
          laydate.render({
            elem: '#beginTime' //日期input id
            , done: function (value, date) { //监听日期被切换

            }
            , type: 'datetime'
            , theme: '#3dbeed'
          });
          laydate.render({
            elem: '#endTime'
            , done: function (value, date) { //监听日期被切换

            }
            , type: 'datetime'
            , theme: '#3dbeed'
          });
        });
      },

      _initTab = function (activeIndex) {
        _root.find("#listTab").find("li").click(function () {
          _clearSearch(true);
          $(this).siblings("li").removeClass("active");
          $(this).addClass("active");
          var index = parseInt($(this).attr("index"));
          _hideAllTab();
          //控制领书模块bookId显示
          // if (index == 0){
          //   _root.find("#bookId").parents("Li").css("display", "inline");
          // }else {
          //   _root.find("#bookId").parents("Li").css("display", "inline");
          // }
          _hideTimeSelectAndShow(false);
          if (index == 100) {
            _root.referenceBookList.show();
            _refHint.show();
            _currentTab = _root.referenceBookList;
            _clearSearch(true)
          } else if (index == 0) {
            _root.nbeBookList.show();
            _currentTab = _root.nbeBookList;
            _bookState = 0;
            _refreshList();
          }
          $('#curContentTab').html($('#listTab .active a').html());
        });

        _currentTab = _root.referenceBookList;

        if (activeIndex) {
          _root.find("#listTab li[index='" + activeIndex + "']").click();
        }

        // _refreshList();
      },
      //隐藏所有tab
      _hideAllTab = function () {
        _root.referenceBookList.hide();
        _root.nbeBookList.hide();
        $("#searchTerms").show();
        _refHint.hide();
      },
      //显示或者隐藏元素
      _hideTimeSelectAndShow = function(isShow){
        if(isShow){
          $(".search-all").css("display","block");
          $(".search-other").css("display" , "none");
          $("#exprotSerach").css("display","block");
        } else {
          $(".search-all").css("display","none");
          $(".search-other").css("display" , "block");
          $("#exprotSerach").css("display","none");
        }
      },

      _refreshPictureUpdateList = function(page){
        parameter.modelId =  nbeRepoId;
        parameter.module = -1;
        if(page == undefined){
          page = 1;
        }
        let _width = window.screen.width;
        let _pageSize = 16;
        if (_width <= 1600) {
          _pageSize = 12;
        }
        $.get(_conf.LIST_RECORD_STATE_URL,{
          modelId:parameter.modelId,
          currentPage: page,
          pageSize:_pageSize
        },function (data) {
          let dom = $(data);
          let pagination = dom.find("#pagination");
          if (pagination.length > 0) {
            _initPagination(pagination);
          }
          _currentTab.html(dom);
          _initVue();
        });
      },

      _refreshList = function (page, isSelectPool) {
        //领书模块切换资源库不需要搜索
        if (_currentTab == _root.referenceBookList && isSelectPool) {
          return;
        }

        _setUpParameters();

        if(parameter.stateArray != null) {
          for (let i = 0; i < parameter.stateArray.length; i++) {
            if (parseInt(parameter.stateArray[i]) == -1) {
              parameter.forbidden = 1;
              parameter.stateArray.splice(i, 1);
              i--;
            }
          }
        }
        if (_currentTab == _root.referenceBookList) {
          //  领取书本
          parameter.ref = true;
          parameter.status = BOOK_PUBLISH_STATE;
          status = BOOK_PUBLISH_STATE;
          parameter.module = 0;
        } else if (_currentTab == _root.nbeBookList) {
          //书库
          parameter.status = REPO_ALL_STATE;
          status = REPO_ALL_STATE;
          parameter.module = 1;
        }

        if (parameter.module == 0) {
          if (!_contentIsNull(parameter._searchContent)) {
            layer.msg("请输入搜索信息");
            return;
          }
        }
        if(parameter.module == 5){
          if(!_searchAllContentIsNull()){
            layer.msg("请输入搜索信息");
            return;
          }
          if(parameter.beginTime != ""){
            if(parameter.endTime == ""){
              _mags("请选择结束时间");
              return;
            }
          } else {
            if(parameter.endTime != ""){
              _mags("请选择开始时间");
              return;
            }
          }
          if (parameter.beginTime >  parameter.endTime) {
            _mags('结束时间不能早于开始时间！');
            return ;
          }
          if ( parameter.beginTime != "" &&  parameter.beginTime ==  parameter.endTime) {
            _mags('开始时间与结束时间不能相同！');
            return ;
          }
        }
        if (isNaN( parameter._searchContent.isbn)) {
          layer.msg("ISBN必须为数字");
          return;
        }
        if (isNaN( parameter._searchContent.bookId)) {
          layer.msg("BookID必须为数字");
          return;
        }
        if (isNaN( parameter._searchContent.bookNumber)) {
          layer.msg("书本编号必须为数字");
          return;
        }
        if (page == undefined) {
          page = 1;
        }
        var _width = window.screen.width;
        var _pageSize = 16;
        if (_width <= 1600) {
          _pageSize = 12;
        }

        $.get(_conf.URL_LIST_BOOK, {
          modelId: parameter.modelId,
          module:  parameter.module,
          currentPage: page,
          isRef: parameter.ref,
          status: parameter.status,
          beginTime:parameter.beginTime,
          endTime:parameter.endTime,
          content: JSON.stringify(parameter._searchContent),
          forbidden: parameter.forbidden,
          pageSize: _pageSize,
          isShowWanTongState: false,
          isNbe: true
        }, function (data) {
          var dom = $(data);
          var pagination = dom.find("#pagination");
          var bookCount = dom.find("#bookCount");
          if (_currentTab == _root.referenceBookList || _currentTab
              == _root.searchAllBookList) {
            bookCount.hide();
          } else {
            bookCount.show();
          }
          if (pagination.length > 0) {
            _initPagination(pagination);
          }
          if (_isClickSearch) {
            if (dom.find("#noBooks").length > 0) {
              layer.msg("没有查询到符合条件的书本");
            }
            _isClickSearch = false;
          }
          _currentTab.html(dom);
        })
      },
      //提示信息
      _mags = function (mags) {
        layer.open({
          title: '提示'
          , content: mags
        });
      },
      _contentIsNull = function (searchContent) {

        if (searchContent.bookName == "" && searchContent.isbn == ""
            && searchContent.press == "" &&
            searchContent.dubble == "" && searchContent.edition == ""
            && searchContent.bookNumber == "" && searchContent.bookId == ""
            && searchContent.labelName == "") {
          return false;
        } else {
          return true;
        }
      },
      _searchAllContentIsNull = function(){
        if (parameter._searchContent.bookName == "" &&  parameter._searchContent.isbn == ""
            &&  parameter._searchContent.press == "" &&
            parameter._searchContent.dubble == "" &&  parameter._searchContent.edition == ""
            &&  parameter._searchContent.bookNumber == "" &&  parameter._searchContent.bookId == ""
            &&  parameter._searchContent.labelName == "" &&  parameter._searchContent.labelIds == null && parameter.beginTime == "" && parameter.endTime == "" && parameter.stateArray == null) {
          return false;
        } else {
          return true;
        }
      },
      _refreshPictureRecordCurrentPage = function(){
        _currentPage = _currentTab.find('#pagination').attr('currentpage');
        _refreshPictureUpdateList(_currentPage);
      },
      _refreshCurrentPage = function () {
        _currentPage = _currentTab.find('#pagination').attr('currentpage');
        _refreshList(_currentPage);
      },
      _initPagination = function (paginationDom) {
        var currentPage = parseInt(paginationDom.attr("currentPage"));
        var totalPages = parseInt(paginationDom.attr("pages"));
        //初始化页码
        paginationDom.html('');
        if (0 == totalPages) {
          return;
        } else {
          var lastPageAppend = 0;
          for (var i = 1; i < totalPages + 1; i++) {
            if (totalPages > 4 && Math.abs(currentPage - i) > 1 && i != 1 && i
                != totalPages) {
              continue;
            }

            if (lastPageAppend + 1 != i) {
              paginationDom.append(
                  '<li class="page-back-b2" class="disabled"><a href="#" onclick="return false;">...</a></li>');
            }
            //&& currentPage != 1
            if (i == 1) {
              paginationDom.append(
                  '<li page="-1" class="page-back"><a href="#" aria-label="Previous"><img src="static/images/ico9_03.png"></a></li>');
            }

            if (i == currentPage) {
              paginationDom.append(
                  '<a href="#"><li class="active" page="' + i + '">' + i
                  + '</li></a>');
            } else {
              paginationDom.append(
                  '<li class="page-back-b2" page="' + i + '"><a href="#">' + i
                  + '</a></li>');
            }

            if (i == totalPages) {
              paginationDom.append(
                  '<li page="0" class="page-back"><a href="#" aria-label="Next"><img src="static/images/ico9_05.png"></a></li>');
            }
            lastPageAppend = i;
          }
          paginationDom.append(
              '<Li>到第</Li><Li><input type="text" id="jumpPage" class="page-box page-back"/></Li><Li>页</Li><button type="button" class="page-input" id="jumpButton">跳转</button>');
        }
        paginationDom.find("#jumpButton").on("click", function () {
          var jumpPage = paginationDom.find("#jumpPage").val();
          var jumpPage2 = parseInt(jumpPage);
          if (jumpPage2 != NaN && jumpPage2 > 0 && jumpPage2 <= totalPages) {
            $("html,body").animate({scrollTop: 0}, 10);
            if(_currentTab != _root.pictureUpdateRecordList) {
              _refreshList(jumpPage2);
            }else {
              _refreshPictureUpdateList(jumpPage2);
            }
          } else {
            layer.msg("请输入正确页数")
          }
        });
        paginationDom.keydown(function (event) {
          var i = event.keyCode;
          if (event.keyCode == 13) {
            paginationDom.find("#jumpButton").click();
          }
        });
        paginationDom.delegate("li", "click", function (event) {
          var paginationTag = $(event.currentTarget);
          var page = paginationTag.attr("page");
          var currentPage = parseInt(paginationDom.attr("currentPage"));
          var totalPages = parseInt(paginationDom.attr("pages"));
          if (page == "-1") {
            var prevPage = currentPage - 1;
            if (prevPage >= 1) {
              if(_currentTab != _root.pictureUpdateRecordList) {
                _refreshList(prevPage);
              }else {
                _refreshPictureUpdateList(prevPage);
              }
            }
          } else if (page == "0") {
            var nextPage = currentPage + 1;
            if (nextPage <= totalPages) {
              if(_currentTab != _root.pictureUpdateRecordList) {
                _refreshList(nextPage);
              }else {
                _refreshPictureUpdateList(nextPage);
              }
            }
          } else {
            if (page != undefined) {
              if(_currentTab != _root.pictureUpdateRecordList) {
                _refreshList(page);
              }else {
                _refreshPictureUpdateList(page);
              }
            }
          }
        });
      },
      _initButtons = function () {
        _root.delegate(".thumbnailContainer", "mouseover", function () {
          var buttonContainer = $(this).find("#buttonContainer");
          _showButtonContainer(buttonContainer);
        });
        _root.delegate(".thumbnailContainer", "mouseout", function () {
          var buttonContainer = $(this).find("#buttonContainer");
          _hideButtonContainer(buttonContainer);
        });
        _root.delegate(".dlClass", "mouseover", function () {
          var icoDom = $(this).find(".pro-window-ico");
          _showButtonContainer(icoDom);
        });
        _root.on('mouseleave', '.pro-window', function () {
          $(this).find(".pro-window-box").css('display', 'none');
          $(this).find(".pro-window-ico").css('visibility', 'hidden');
        });
        _root.delegate(".dlClass", "mouseout", function () {
          var icoDom = $(this).find(".pro-window-ico");
          var displayVal = icoDom.next().css("display");
          if (displayVal != "block") {
            _hideButtonContainer(icoDom);
          }
        });
        _root.delegate(".pro-window-ico", "click", function (event) {

          event.stopPropagation();

          var boxDom = $(this).next(".pro-window-box");
          boxDom.toggle();
        });

        _root.off("click", ".picture-hover").on("click", ".picture-hover",
            function (event) {
              event.stopPropagation();
              $(event.currentTarget).find("#thumbnail").click();
              $(event.currentTarget).find('.glyphicon').click();
            });
        _root.delegate("#editBtn", "click", function (event) {

          event.stopPropagation();

          parameter._searchContent.bookId = $(event.currentTarget).attr("bookId");
          let baseBookId = $(event.currentTarget).attr("baseBookId");
          let bookInfoState = $(event.currentTarget).attr("bookState");
          parameter.forbidden = $(event.currentTarget).attr("forbidden");
          let baseModelId = $(event.currentTarget).attr("baseModelId");
          if (_currentTab == _root.searchAllBookList && (bookInfoState == 3
              || bookInfoState == 11)) {
            parameter._searchContent.status = REPO_PUBLISH_STATE;
          }

          _editBook(parameter._searchContent.bookId, baseBookId, baseModelId, bookInfoState);
        });

        _root.delegate("#checkBookBtn", "click", function (event) {
          event.stopPropagation();

          parameter._searchContent.bookId = $(event.currentTarget).attr("bookId");
          var baseBookId = $(event.currentTarget).attr("baseBookId")
          parameter.forbidden = $(event.currentTarget).attr("forbidden");
          var baseModelId = $(event.currentTarget).attr("baseModelId");
          var bookInfoState = $(event.currentTarget).attr("bookState");
          if (_currentTab == _root.searchAllBookList && bookInfoState == 7) {
            parameter.status = REPO_CHECK_STATE;
            status = REPO_CHECK_STATE;
          }
          _checkBook(parameter._searchContent.bookId, baseBookId, baseModelId, bookInfoState);
        });
        _root.delegate("#deleteBtn", "click", function (event) {
          event.stopPropagation();

          parameter._searchContent.bookId = $(event.currentTarget).attr("bookId");
          _deleteBook(parameter._searchContent.bookId);
        });

        _root.delegate("#checkAllBook", "click", function (event) {
          event.stopPropagation();

          if ($(this).prop("checked")) {
            //取消所有选中
            $("input[name='checkbook']").each(function () {

              $(this).parents("dl").addClass("check-book");
              $(this).prop("checked", "true");
            })
          } else {
            $("input[name='checkbook']").each(function () {

              $(this).parents("dl").removeClass("check-book");
              $(this).removeAttr("checked");
            });
          }
        });
        _root.delegate("#refBookBtn", "click", function (event) {
          var thisBtn = $(this);
          thisBtn.blur();
          var nowTime = new Date().getTime();
          var clickTime = thisBtn.attr("ctime");
          if (clickTime != 'undefined' && (nowTime - clickTime
              < 5000)) {
            return false;
          } else {
            thisBtn.attr("ctime", nowTime);
          }
          event.stopPropagation();

          var books = {
            baseBookIds: new Array(),
            repoId: 0
          };
          var repoId = nbeRepoId;
          var baseBookIds = new Array();
          $("input[name='checkbook']").each(function () {
            if ($(this).prop("checked")) {
              baseBookIds.push(parseInt($(this).attr("refBookId")));
            }
          });
          books.baseBookIds = baseBookIds;
          books.repoId = repoId;

          if (books.baseBookIds.length == 0) {
            layer.msg("请选择领取书本");
            return;
          }
          $.ajax({
            type: "post",
            dataType: "json",
            url: _conf.RECEIVE_BOOK_URL,
            contentType: "application/json",
            data: JSON.stringify(books),
            async: false,
            success: function (data) {
              if (data.code == 0) {
                //FIXME 等待异步文档索引同步完成，加个延迟
                setTimeout(function () {
                  layer.msg("领取成功");
                  _refreshCurrentPage();
                }, 1000);
              } else {
                layer.msg("领取失败");
                return;
              }
            },
            error: function () {
              layer.msg("服务器错误");
            }

          });
        });
        _root.delegate("input[name='checkbook']", "click", function () {
          if ($(this).prop("checked")) {

            $(this).parents("dl").addClass("check-book");
            if(_isAllCheckBoxSelect()){
              _root.find("#checkAllBook").prop("checked", "true");
            }
          } else {
            $(this).parents("dl").removeClass("check-book");
            $("#checkAllBook").removeAttr("checked");
          }

        });
        _root.delegate("#thumbnail", "click", function (event) {
          event.stopPropagation();

          if ($(this).attr("isEdit") != undefined && !JSON.parse(
              $(this).attr("isEdit"))) {
            layer.msg("该书本图像正在升级维护中，暂不可制作资源");
          }
          if ($(this).attr("isOnCopy") != undefined && JSON.parse(
              $(this).attr("isOnCopy"))) {
            layer.msg("书本资源正在迁移中，请稍后再试");
          }
        });
        _initClickEvent();

        $("#importRepo").off("click").on("click", function () {
          _uploader.upload();
        });

        $(".export").off("click").on("click", function() {
          if(parameter.stateArray != null){
            for (let i = 0; i <parameter.stateArray.length; i++ ){
              if (parseInt(parameter.stateArray[i]) == -1) {
                parameter.forbidden = 1;
                parameter.stateArray.splice(i, 1);
                i--;
              }
            }
          }
          if(!_searchAllContentIsNull()){
            layer.msg("请先搜索书本");
            return;
          }
          if(parameter.beginTime != ""){
            if(parameter.endTime == ""){
              _mags("请选择结束时间");
              return;
            }
          } else {
            if(parameter.endTime != ""){
              _mags("请选择开始时间");
              return;
            }
          }
          if (parameter.beginTime > parameter.endTime) {
            _mags('结束时间不能早于开始时间！');
            return ;
          }
          if (parameter.beginTime != "" && parameter.beginTime == parameter.endTime) {
            _mags('开始时间与结束时间不能相同！');
            return ;
          }
          if (isNaN(parameter._searchContent.isbn)) {
            layer.msg("ISBN必须为数字");
            return;
          }
          if (isNaN(parameter._searchContent.bookId)) {
            layer.msg("BookID必须为数字");
            return;
          }
          if (isNaN(parameter._searchContent.bookNumber)) {
            layer.msg("书本编号必须为数字");
            return;
          }
          let labelNames = _root.find("#label-name-select").val();

          parameter.status = "";
          if(parameter._searchContent.labelIds == null){
            parameter._searchContent.labelName = _root.find("#label-name-select").val();
          }
          if(parameter.stateArray != null) {
            for (let i = 0; i < parameter.stateArray.length; i++) {
              if (parameter.status == "") {
                parameter.status = parameter.stateArray[i];
              } else {
                parameter.status = parameter.status + "," + parameter.stateArray[i]
              }
            }
          }
          //loading层
          var index = layer.load(1, {
            shade: [0.3,'#fff'] //0.1透明度的白色背景
          });

          $.get(_conf.EXPORT_URL,{
            modelId: parameter.modelId,
            status: parameter.status,
            content: JSON.stringify(parameter._searchContent),
            beginTime:parameter.beginTime,
            endTime:parameter.endTime,
            forbidden: parameter.forbidden,
            labelNames:parameter.labelNames
          },function (data) {
            if(data.code == 0){
              if(data.data.length <=0){
                layer.msg("导出无数据");
                layer.close(index);
              } else {
                var excelData = data.data;
                var newArr = excelData.map((e)=>(
                    {
                      '书本编号': e.number,
                      'bookId':e.bookId,
                      '书名':e.bookName,
                      'isbn':e.isbn,
                      '作者': e.author,
                      '所属系列':e.series_title,
                      '状态':e.state,
                      '时间':e.time,
                      '书本标签':e.label
                    }

                ));
                console.log(newArr);
                Excel.download(newArr,"资源库书本信息数据"+".xlsx");
                layer.close(index);
              }
            }
          });
        });
      },
      //检测是否所有的选择按钮都被选中
      _isAllCheckBoxSelect = function(){
        var isCheck = true;
        _root.find(".ref-check-btn").each(function (i) {
          if(!$(this).prop("checked")){
            isCheck = false;
            return isCheck;
          }
        });
        if(!isCheck){
          return isCheck;
        }else {
          return true;
        }
      },
      //显示按钮
      _showButtonContainer = function (container) {
        var visiableValue = container.css("visibility");
        if (visiableValue == "hidden") {
          container.css("visibility", "visible");
        }
      },
      //影藏按钮
      _hideButtonContainer = function (container) {
        var visiableValue = container.css("visibility");
        if (visiableValue != "hidden") {
          container.css("visibility", "hidden");
        }
      },
      isNotNull = function (temp) {
        return !isNull(temp);
      },
      isNull = function (temp) {
        return temp == undefined || temp == ""
      },
      _showCreateBookPage = function (modelId, bookId, baseBookId, isExamine,
                                      moduleValue, bookState, baseModelId, bookInfoState) {
        var title = "编辑书本";
        $.post(_conf.addBookPage, {
          modelId: modelId,
          bookId: bookId,
          baseBookId: baseBookId,
          baseModelId: baseModelId,
          examine: isExamine,
          moduleValue: moduleValue,
          bookState: bookState,
          bookInfoState: bookInfoState,
          entryType: 1
        }, function (html) {
          layer.open({
            title: title,
            type: 1,
            maxmin: false,
            resize: false,
            area: ['900px', '770px'],
            content: html,
            end: function () {
              /*wantong.frame.showPageGet(GlobalVar.backPath, GlobalVar.data);*/
              wantong.cms.bookAdd.destroy();
            },
            cancel: function () {
              if(_currentTab != _root.pictureUpdateRecordList) {
                _refreshCurrentPage();
              }else {
                _refreshPictureRecordCurrentPage();
              }
              _initStateSelect();
              layer.closeAll();
            }
          });
        });

      },
      _deleteBook = function (bookId) {

        var text = "确认删除这本书吗？（删除后，这本书下的全部资源将被清除，如需再次制作资源，需重新领书）";
        //防止用户重复点击按钮
        var bool = false;
        layer.confirm(text, {
          btn: ['确定', '取消'] //按钮
        }, function () {
          if (!bool) {
            var url = _conf.URL_DELETE_BOOK;
            url = url.replace("{id}", bookId);
            $.get(url, {}, function (data) {
              console.log("deleteBook:" + data.code + "and msg:" + data.msg)
              if (data.code == 0) {
                layer.msg("已删除");
                setTimeout(function () {
                  _refreshCurrentPage();
                },500);
              } else {
                layer.msg("删除失败");
              }
            }).fail(function () {
              layer.msg("删除失败，服务不可用");
            });
            bool = true;
          }
        });
      },
      _editBook = function (bookId, baseBookId, baseModelId, bookInfoState) {
        parameter.modelId = nbeRepoId ;
        _showCreateBookPage(parameter.modelId, bookId, baseBookId, false, parameter.module,
            parameter.module, baseModelId, bookInfoState);
      },
      _checkBook = function (bookId, baseBookId, baseModelId, bookInfoState) {
        parameter.modelId = nbeRepoId;
        _showCreateBookPage(parameter.modelId, bookId, baseBookId, true, parameter.module, parameter.module,
            baseModelId, bookInfoState);
      },
      _packUpBook = function (bookId) {
        console.log("_packUpBook " + bookId);
        var tips = layer.msg('正在请求打包数据...', {
          icon: 16,
          shade: [0.5, '#f5f5f5'],
          scrollbar: false,
          offset: 'auto',
          time: 100000
        });
        $.post(_conf.URL_PACKUP, {
          bookId: bookId
        }, function (html) {
          layer.close(tips);
          _root.find("#listTab").find("li[index='3']").click();
          jsonData = html;
          if (typeof html == 'string') {
            jsonData = $.parseJSON(html);
          } else {
            jsonData = html;
          }
          console.log('package...');
          if (jsonData.code != 0) {
            layer.alert("打包失败 - " + jsonData.code + "<br>" + jsonData.msg,
                {icon: 5});
          } else {
            layer.alert("系统正在后台重新打包，请稍后重新下载资源！", {icon: 1});
          }
        });
      },
      _initClickEvent = function () {
        $("#searchTerms").keydown(function (event) {
          if (event.keyCode == 13) {
            _refreshList(0);
            _isClickSearch = true;
          }
        });
        $("#searchTerms").find(".con-search-input input[value='搜索']").off(
            "click").on("click", function () {
          _refreshList(0);
          _isClickSearch = true;
        });
        $("#searchTerms").find(".con-search-input input[value='清空']").off(
            "click").on("click", function () {
          if (parameter.module == 0) {
            _clearSearch(true);
          } else {
            _clearSearch(false);
          }
        });
      },
      _setUpParameters = function () {
        parameter._searchContent.bookName = _root.bookName.val().replace(/^\s+/, "");
        parameter._searchContent.dubble = _root.dubble.val().replace(/^\s+/, "");
        parameter._searchContent.press = _root.press.val().replace(/^\s+/, "");
        parameter._searchContent.isbn = _root.isbn.val().replace(/^\s+/, "");
        parameter._searchContent.labelName = _root.labelName.val().replace(/^\s+/, "");
        parameter._searchContent.bookId = _root.bookId.val().replace(/^\s+/, "");
        parameter._searchContent.edition = _root.edition.val().replace(/^\s+/, "");
        parameter._searchContent.bookNumber = _root.bookNumber.val().replace(/^\s+/, "");
        parameter.modelId = nbeRepoId;
        parameter.ref = false;
        parameter.forbidden = 0;
        parameter.module = 0;
        parameter.beginTime = _root.find("#beginTime" ).val();
        parameter.endTime = _root.find("#endTime").val();
        parameter.status = "";
      },
      _clearSearch = function (clearHtml) {

        _root.bookName.val("");
        _root.isbn.val("");
        _root.press.val("");
        _root.dubble.val("");
        _root.edition.val("");
        _root.bookNumber.val("");
        _root.bookId.val("");
        _root.labelName.val("");
        _root.endTime.val("");
        _root.beginTime.val("");
        _root.searchLabels.val("");
        _root.searchAllLabelIds.val("");
        _root.states.val("");
        _root.stateName.text("选择状态");
        _root.find("#stateSelector").find("ul input[type='checkbox']").each(function(){
          $(this).prop("checked",false);
        });
        if (clearHtml) {
          _currentTab.html("");
        }
        _clearParam();
      },
      _initVue = function () {
        _initVueData();
        let app = new Vue({
          el:"#bookChangeRecord",
          data:viewModel,
          methods:{
            change (e) {
              this.$forceUpdate()
            },
            handleClose(){
              viewModel.dialogTableVisible = false;
              _refreshPictureRecordCurrentPage();
            }
          },
        })
      },
      _openDig = function (bookId) {
        $.get(_conf.LIST_BOOK_CHANGE_RECORD_URL,{
          bookId:bookId
        },function (data) {
          if(data.code == 0){
            let body = [];
            for (var i = 0; i< data.data.length;i++){
              body.push(data.data[i])
            }
            viewModel.bookId=bookId;
            viewModel.gridData = body;
            viewModel.dialogTableVisible = true;
            _lookOverEvent(bookId);
          }else {
            layer.msg("服务异常");
          }
        });
      },
      _initVueData = function () {
        viewModel = {};
        viewModel.gridData =[];
        viewModel.bookId = 0;
        viewModel.dialogTableVisible=false;
      },
      _lookOverEvent =function (bookId) {
        _changeRecordBookState(0,bookId);
      },
      _clearParam = function(){
        parameter. modelId = 0;
        parameter. module = 0;
        parameter.currentPage = 0;
        parameter.isRef = false;
        parameter.status = status;
        parameter. beginTime = "";
        parameter.endTime = "";
        parameter.forbidden = 0;
        parameter.pageSize = 0;
        parameter.stateArray =null;
        parameter._searchContent.bookName= "";
        parameter._searchContent.isbn= "";
        parameter._searchContent. press= "";
        parameter._searchContent.dubble= "";
        parameter._searchContent. edition= "";
        parameter._searchContent.bookNumber= "";
        parameter._searchContent.bookId= "";
        parameter._searchContent.labelName= "";
        parameter._searchContent.labelIds=null;
        parameter.status = "";
      },
      _changeRecordBookState = function (state, bookId) {
        //    修改书本未查看的状态为
        $.get(_conf.CHANGE_RECORD_STATE_URL,{
          bookId:bookId,
          state:state
        },function (data) {
          if(data.code == 0){
            //  todo 属性当前页面

          }else {
            layer.msg("服务异常");
          }
        });
      };

  return {
    init: function (activeIndex,repoId) {
      _init(activeIndex,repoId);
    },
    refreshCurrentPage: function () {
      if(_currentTab != _root.pictureUpdateRecordList) {
        _refreshCurrentPage();
      }else {
        _refreshPictureRecordCurrentPage();
      }
    },
    closeLabelLayer:function (ids,labelNames,labelName) {
      _labelLayerClose(ids,labelNames,labelName);
    },
    refreshEvent: function () {
      _initStateSelect();
    }
  }
})();

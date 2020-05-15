
wantong.base = {};
wantong.base.booklist = (function () {
  var
      STATUS_PUBLISHED = "3", //已发布
      STATUS_MAKING = "0",//待制作
      STATUS_MAKING_SAMPLE = "1",//待采样
      STATUS_EXAMINE = "7", //待审核
      STATUS_UNPUBLISHED = "4,6",//已制作待训练
      STATUS_IN_PROGRESS = "5", //训练中
      STATUS_NY = "0,1,7", //ny书本状态
      EXAMINE_PUBLISHED = "6",
      EXAMINE_UNPUBLICSHED = "0,1,2,3,4,5",
      STATUS_SEARCHALL = "0,1,3,4,5,6,7",
      EXAMINE_ALL = "",
      _root = null,
      _headerBtnGroup = null,
      _currentTab = null,
      _currentPage = 0,
      _scanConnect = false,
      _connectScanIpContainer = null,
      _layerIndex = null,
      _moduleValue = 0, //1是书本信息带创建 2是待采样 3是书本待编辑 4 是带训练 5 是训练中 6 是待审核 0 已发布BookState
      _bookState = 4,//是其他模块
      _openCreateBook = true,

      _module = 0,//位于哪个模块
      _totalBooksNum = 0,
      _bookInfoState = 0,

      _isAuthExport = false,
      _conf = {
        addBookPage: "base/showAddBookPage.do",
        createTask: "cms/createTask.do",
        ADD_PAGE_URL: "base/showAddPage.do",
        URL_PUBLISH: "base/publish.do",
        URL_PACKUP: "base/packUp.do",
        URL_TRAINING_ALL: "cms/publishAll.do",
        URL_SHOW_EDIT_BOOK_PAGE: "base/showEditBookPage.do",
        URL_LIST_BOOK: "base/listBooks.do",
        URL_DELETE_BOOK: "base/deleteBook.do?bookId={id}&deleteType=0",
        forbiddenBook: "base/forbiddenBook.do",
        LOOK_REPO_MAKED: "base/lookRepoMaked.do",
        REPLACE_BASE_BOOK: "/base/replaceBaseBook.do",
        BOTH_BASE_BOOK_IN_ONE_REPO: "/base/bothBaseBookInOneRepo.do",
        GET_BOOK_SIZE: "/cms/getBookSize.do",
        SIMILAR_PAGE_URL: "base/similarSet.do"
      },
      _init = function (conf) {
        /*
          Sprint8 k12图像库隐藏ny2
         */

        let $modelSelector = $("#modelId");
        $modelSelector.on("change", function () {
          let modelId = $modelSelector.val();
          let $nyTab = $("#listTab li[index=10]");
          if (modelId == 29){
            $nyTab.hide();
          }else {
            $nyTab.show();
          }
        });
        $.extend(_conf, conf);
        _root = $("#bookList");
        _root.makingBookList = $("#makingBookList");
        _root.sampleBookList = $("#sampleBookList");
        _root.unpublishedBookList = $("#unpublishedBookList");
        _root.publishedBookList = $("#publishedBookList");
        _root.inProgressBookList = $("#inProgressBookList");
        _root.inExamineBookList = $("#inExamineBookList");
        _root.allSearchBookList = $("#searchAllBookList");
        _root.nyBookList = $("#nyBookList");
        _root.similarSetList = $('#similarBookSet');
        _isAuthExport = JSON.parse($("#isAuthExport").attr("auth"));
        _assignValues();
        _initAppSelector();
        _initTab();
        _root.find("#createTaskBtn").click(function () {
          $(this).blur();
          _createBook();
        });

        _root.find("#importExcelBtn").click(function () {
          $(this).blur();
          _showExcelImportDialog();
        });
        _initButtons();
        _initScanConnect();
        _initExcelImportDialog();
        _renderHistory();
      },
      _initTab = function () {
        _root.find("#listTab").find("li").click(function () {
          _clearSearch();
          $(this).siblings("li").removeClass("active");
          $(this).addClass("active");
          var index = parseInt($(this).attr("index"));
          _hideAllTab();
          _showAndHideSearchAllFrame(false);
          _bookState = 4;
          _module = index;
          _root.find('.con-r-top').css('display', 'block');
          if (index == 3) {
            _switchDisplay(false);
            _root.publishedBookList.show();
            _currentTab = _root.publishedBookList;
            _moduleValue = 0;
            _refreshList();
          } else if (index == 4) {
            _bookState = 4;
            _switchDisplay(false);
            _root.unpublishedBookList.show();
            _currentTab = _root.unpublishedBookList;
            _refreshList();
            _moduleValue = index;
          } else if (index == 5) {
            _bookState = 5;
            _switchDisplay(false);
            _root.inProgressBookList.show();
            _currentTab = _root.inProgressBookList;
            _moduleValue = index;
            _refreshList();
          } else if (index == 7) {
            _bookState = 7;
            _switchDisplay(false);
            _root.inExamineBookList.show();
            _currentTab = _root.inExamineBookList;
            _moduleValue = index;
            _refreshList();
          } else if (index == 0) {
            _switchDisplay(false);
            _bookState = 0;
            _root.makingBookList.show();
            _currentTab = _root.makingBookList;
            _moduleValue = index;
            _refreshList();
          } else if (index == 1) {
            _switchDisplay(false);
            _bookState = 1;
            _root.sampleBookList.show();
            _currentTab = _root.sampleBookList;
            _moduleValue = index;
            _refreshList();
          } else if (index == 100) {
            _showAndHideSearchAllFrame(true);
            $("#bookOriginDiv").css("display", "none");
            _switchDisplay(true);
            _root.allSearchBookList.show();
            _currentTab = _root.allSearchBookList;
            wantong.base.booklist.search.init({
              modelId: _root.find("#modelId").val(),
              currentTab: _currentTab,
              status: STATUS_SEARCHALL,
              module: _module
            });
            //_refreshList();
          } else if (index == 10) {
            _switchDisplay(false);
            _bookState = 1;
            _root.nyBookList.show();
            _currentTab = _root.nyBookList;
            _moduleValue = index;
            _refreshList();
          } else if (index == 20) {
            console.log('similar book set');
            _root.find('.con-r-top').css('display', 'none');
            _switchDisplay(false);
            _root.similarSetList.show();
            _currentTab = _root.similarSetList;
            _moduleValue = index;
            _loadSimilarSet();
          }
          //设置导航栏标题
          $('#curContentTab').html($('#listTab .active a').html());
        });
        _currentTab = _root.allSearchBookList;
        _root.find("#listTab li[index='100']").click();
        _switchDisplay(true);
        _refreshList();
      },
      _loadSimilarSet = function() {
        var modelId = _root.find("#modelId").val();
        $.ajax({
          url: _conf.SIMILAR_PAGE_URL + "?modelId=" +modelId +"&page=1",
          type: 'GET',
          async: false,
          success: function (data) {
            var dom = $(data);
            _root.similarSetList.html(dom);
          }
        });
      },

      _showAndHideSearchAllFrame = function(isShow) {
          if(!_isAuthExport){
            isShow = false;
          }
          if(isShow){
            $(".search-all").css("display","block");
            $(".search-other").css("display" , "none");
            $("#exprotSerach").css("display","block")
          } else {
            $(".search-all").css("display","none");
            $(".search-other").css("display" , "block");
            $("#exprotSerach").css("display","none");
          }

      },
      _hideAllTab = function () {
        _root.makingBookList.hide();
        _root.sampleBookList.hide();
        _root.unpublishedBookList.hide();
        _root.publishedBookList.hide();
        _root.inProgressBookList.hide();
        _root.inExamineBookList.hide();
        _root.allSearchBookList.hide();
        _root.nyBookList.hide();
        _root.similarSetList.hide();
      },
      _refreshList = function (page) {
        console.log("_refreshList");
        var modelId = _root.find("#modelId").val();
        var exStatus = "";
        var origin = -1;
        if (_currentTab == _root.publishedBookList) {
          //已发布
          status = STATUS_PUBLISHED;
          exStatus = EXAMINE_PUBLISHED;
          origin =  _root.find("#bookOriginSelect").val();
        } else if (_currentTab == _root.unpublishedBookList) {
          //已制作待训练
          status = STATUS_UNPUBLISHED;
          exStatus = EXAMINE_ALL;
          origin =  _root.find("#bookOriginSelect").val();
        } else if (_currentTab == _root.makingBookList) {
          //封面待制作
          status = STATUS_MAKING;
          exStatus = EXAMINE_ALL;
          origin = 0;
        } else if (_currentTab == _root.sampleBookList) {
          //待采集
          status = STATUS_MAKING_SAMPLE;
          exStatus = EXAMINE_ALL;
          origin = 0;
        } else if (_currentTab == _root.inProgressBookList) {
          //训练中
          status = STATUS_IN_PROGRESS;
          exStatus = EXAMINE_ALL;
          origin =  _root.find("#bookOriginSelect").val();
        } else if (_currentTab == _root.inExamineBookList) {
          //待审核
          status = STATUS_EXAMINE;
          exStatus = EXAMINE_UNPUBLICSHED;
          origin = 0;
        } else if (_currentTab == _root.allSearchBookList) {
          return;
        } else if (_currentTab == _root.nyBookList) {
          status = STATUS_NY;
          exStatus = EXAMINE_ALL;
          origin = 2;
        } else if (_currentTab == _root.similarSetList) {
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
          modelId: modelId,
          status: status,
          examine: exStatus,
          currentPage: page,
          pageSize: _pageSize,
          origin: origin
        }, function (data) {
          if (_currentTab === _root.similarSetList) {
            return;
          }

          var dom = $(data);
          var pagination = dom.find("#pagination");
          var bookCount = dom.find("#bookCount");
          //书本数量显示
          if (_currentTab == _root.allSearchBookList) {
            bookCount.hide();
          } else {
            bookCount.show();
          }

          if (pagination.length > 0) {
            _initPagination(pagination);
          }
          _currentTab.html(dom);
          _totalBooksNum = bookCount.attr("bookCount");
          wantong.base.booklist.search.init({
            modelId: _root.find("#modelId").val(),
            currentTab: _currentTab,
            status: status,
            module: _module
          });
          //创建书本信息 按钮
          if (_currentTab == _root.makingBookList) {
            $("#createTaskBtn").css("display", "inline");
            $("#importExcelBtn").css("display", "inline");
          } else {
            $("#createTaskBtn").css("display", "none");
            $("#importExcelBtn").css("display", "none");
          }
          //连接扫码器 按钮
          if (_currentTab == _root.publishedBookList || _currentTab
              == _root.makingBookList ||
              _currentTab == _root.inExamineBookList || _currentTab
              == _root.sampleBookList) {
            $("#connectScan").css("display", "inline");
          } else {
            $("#connectScan").css("display", "none");
          }
          //训练所有绘本 按钮
          if (_currentTab == _root.unpublishedBookList) {
            $("#publishAll").css("display", "inline");
          } else {
            $("#publishAll").css("display", "none");
          }

          if (modelId == 27){
            if (_currentTab == _root.unpublishedBookList || _currentTab
                == _root.publishedBookList || _currentTab
                == _root.inProgressBookList) {
              //待训练 训练中 已发布
              $("#bookOriginDiv").css("display", "inline");
            } else {
              $("#bookOriginDiv").css("display", "none");
            }
          } else {
            $("#bookOriginDiv").css("display", "none");
          }

          if (_currentTab == _root.unpublishedBookList){
            //当显示ny书本图片时
            if (_root.find("#bookOriginSelect").val() == 2){
              $("#publishAll").css("display", "none");
            } else {
              $("#publishAll").css("display", "inline");
            }
          }

          if (_currentTab != _root.inExamineBookList) {
            $(".examineBookBtn").css("display", "none");
            $(".pack-up-btn").css("display", "none");
            $(".pro-window-box").find("#packupLi").css("display", "none");
            $(".glyphicon-check").css("display", "none");
            $(".pro-release").css("display", "none");
          } else {
            $(".glyphicon-edit").css("display", "none");
            $(".glyphicon-check").css("display", "inline-block");
            $(".pro-release").css("display", "block");
          }

          if (_currentTab == _root.inProgressBookList) {
            $(".editBtn-container").css("display", "none");
            $(".pro-window").css("display", "none");
          }
          if (_currentTab == _root.unpublishedBookList) {
            $(".editBtn-container").css("display", "none");
            $(".pro-window").css("display", "none");
          }
          //禁用/启用 是否显示
          if (_currentTab == _root.publishedBookList || _currentTab
              == _root.inExamineBookList) {
            $(".pro-window-box").find("#forbiddenLi").css("display", "block");
          } else {
            $(".pro-window-box").find("#forbiddenLi").css("display", "none");
          }


        });
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
            _refreshList(jumpPage2);
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
              _refreshList(prevPage);
            }
          } else if (page == "0") {
            var nextPage = currentPage + 1;
            if (nextPage <= totalPages) {
              _refreshList(nextPage);
            }
          } else {
            if (page != undefined) {
              _refreshList(page);
            }
          }
        });
      },
      _initAppSelector = function () {
        _root.find("#modelId").change(function () {
          _currentTab = _root.allSearchBookList;
          _clearSearch(true);
          _root.find("#listTab").find("li[index='100']").click();
        });
      },
      _publishAll = function () {
        var modelId = $("#modelId").val();
        if (_totalBooksNum == 0) {
          layer.msg("暂无待训练书本，无法开始训练");
          return;
        }
        $.post(_conf.URL_TRAINING_ALL, {
          modelId: modelId
        }, function (html) {
          setTimeout(function () {
            _root.find("#listTab").find("li[index='5']").click();
          }, 500);

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
        _root.off("click", ".picture-hover").on("click", ".picture-hover",
            function (event) {
              $(event.currentTarget).find(".glyphicon").click();
            });
        _root.delegate(".pro-window-ico", "click", function (event) {
          event.stopPropagation();

          var boxDom = $(this).next(".pro-window-box");
          boxDom.toggle();
        });
        _root.delegate("#editBtn", "click", function (event) {
          event.stopPropagation();

          console.log("editBtn");
          var bookId = $(event.currentTarget).attr("bookId");
          var _bookInfoState = $(event.currentTarget).attr("bookState");
          var isSearchAll = $(event.currentTarget).attr("isSearchAll");
          /*if (_currentTab == _root.allSearchBookList) {
            if (isSearchAll != null && bookState == 3) {
              $("li[index='3']").click();
            } else if (bookState == 0) {
              $("li[index='0']").click();
            } else if (bookState == 1) {
              $("li[index='1']").click();
            }
          }*/
          _editBook(bookId, _bookInfoState);
        });

        _root.delegate("#deleteBtn", "click", function (event) {
          event.stopPropagation();

          var bookId = $(event.currentTarget).attr("bookId");
          var state = $(event.currentTarget).attr("state");
          _deleteBook(bookId, state);
        });
        _root.delegate("#lookRepoBtn", "click", function (event) {
          event.stopPropagation();

          var bookId = $(event.currentTarget).attr("bookId");
          _lookRepoMaked(bookId);
        });

        _root.delegate("#publishAll", "click", function (event) {

          _publishAll();
        });

        _root.delegate("#checkBookBtn", "click", function (event) {
          event.stopPropagation();

          var bookId = $(event.currentTarget).attr("bookId");
          var isSearchAll = $(event.currentTarget).attr("isSearchAll");
          var _bookInfoState = $(event.currentTarget).attr("bookState");
          /*if (_currentTab == _root.allSearchBookList) {
            if (isSearchAll != null) {
              $("li[index='7']").click();
            }
          }*/
          _checkBook(bookId, _bookInfoState);
        });

        _root.delegate("#searchBookBtn", "click", function (event) {
          $("#searchText").val($("#searchInput").val());
          $("#clickSearchBtn").val("click");
          _refreshList(1);
        });
        _root.off("keydown", "input[value='搜索']").on("keydown",
            "input[value='搜索']", function (event) {
              if (event.keyCode == 13) {
                _root.find("input[value='搜索']").click();
              }
            });
        //扫码连接按钮
        _root.delegate("#connectScan", "click", function () {
          if (_scanConnect) {
            scannerConnector.disconnect();
            //手动断开连接，清除isbnIpcookie
            $.cookie("isbnIp", null);
            $("#connectScan").removeClass("frame-Button-b").addClass(
                "frame-Button").text("连接扫码器");
            _scanConnect = false;
          } else {
            window.layer.open({
              title: "连接ISBN扫码器",
              type: 1,
              maxmin: false,
              resize: false,
              area: ['600px', '370px'],
              scrollbar: true,
              content: _connectScanIpContainer,
              end: function () {
                //wantong.frame.showPageGet(GlobalVar.backPath, GlobalVar.data);
                layer.closeAll();
              },
              cancel: function () {

              },
              success: function (layero) {
                var mask = $(".layui-layer-shade");
                mask.appendTo(layero.parent());
                //其中：layero是弹层的DOM对象
              }
            });
            _layerIndex = window.layer.index;
            _connectScanIpContainer.find("#connectIp").focus();
            if ($.cookie("isbnIpContent") != null) {
              _connectScanIpContainer.find("#connectIp").val(
                  $.cookie("isbnIpContent"));
            }
            var isbnApk = _connectScanIpContainer.find("#isbnApk");
            isbnApk.text(GlobalVar.services.ISBN)
            isbnApk[0].href = GlobalVar.services.ISBN;
            _connectScanIpContainer.on('shown.bs.modal', function () {
              // 执行一些动作...
              _connectScanIpContainer.find("#connectIp").focus();
            });
            _connectScanIpContainer.find("#closeButton").click(function () {
              layer.close(_layerIndex);
            });
          }
        });

        _root.delegate("#saveButton", "click", function () {
          var ip = _connectScanIpContainer.find("#connectIp").val();
          var exp = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/;
          if (ip.match(exp) == null) {
            layer.msg("请输入正确的ip地址。");
            return;
          }
          $.cookie("isbnIpContent", ip, {expires: 1});
          scannerConnector.connect(ip);
          $.cookie("isbnIp", ip);
          console.log("saveip:" + $.cookie("isbnIp"));
        });

      },
      _checkBook = function (bookId, _bookInfoState) {
        var modelId = $("#modelId").val();
        if (isNotNull(modelId)) {
          _showCreateBookPage(modelId, bookId, true, _moduleValue, _bookState,
              _bookInfoState);
        } else {
          layer.msg("无法审核绘本，请稍后再试");
        }
      },
      _initScanConnect = function () {
        _connectScanIpContainer = _root.find("#connectScanIpContainer");
        if (scannerConnector.isConnected()) {
          $("#connectScan").removeClass("frame-Button").addClass(
              "frame-Button-b").text("扫码器已连接");
          _scanConnect = true;
        } else {
          $("#connectScan").removeClass("frame-Button-b").addClass(
              "frame-Button").text("连接扫码器");
          _scanConnect = false;
          if ($.cookie("isbnIp") != null && $.cookie("isbnIp") != "null") {
            console.log("getip:" + $.cookie("isbnIp"));
            scannerConnector.connect($.cookie("isbnIp"));
          }
        }
        //监听扫码连接
        scannerConnector.setOpenListener(function () {
          $("#connectScan").removeClass("frame-Button").addClass(
              "frame-Button-b").text("扫码器已连接");
          if (_layerIndex != null) {
            layer.close(_layerIndex);
          }
          _scanConnect = true;
          layer.msg("扫码器连接成功。");
          console.log("connect success");
        });
        scannerConnector.setCloseListener(function () {
          $("#connectScan").removeClass("frame-Button-b").addClass(
              "frame-Button").text("连接扫码器");
          _scanConnect = false;
          //layer.msg("扫码器已断开连接。");
          console.log("connect close");
        });
        scannerConnector.setErrorListener(function () {
          console.log("connect error");
          layer.msg("连接失败！请检查IP地址是否正确，或重启APP后再试。");
          $.cookie("isbnIp", null);
        });
      },
      _clearSearch = function () {
        $("#searchText").val("");
        $("#searchInput").val("");
        $("#clickSearchBtn").val("");
        _root.find("#bookOriginSelect").val(-1);
        wantong.base.booklist.search.clear();
      },
      _showButtonContainer = function (container) {
        var visiableValue = container.css("visibility");
        if (visiableValue == "hidden") {
          container.css("visibility", "visible");
        }
      },
      _hideButtonContainer = function (container) {
        var visiableValue = container.css("visibility");
        if (visiableValue != "hidden") {
          container.css("visibility", "hidden");
        }
      },
      _editBook = function (bookId, _bookInfoState) {
        var modelId = $("#modelId").val();

        _showCreateBookPage(modelId, bookId, false, _moduleValue, _bookState,
            _bookInfoState);
      },
      _lookRepoMaked = function (bookId) {
        $.post(_conf.LOOK_REPO_MAKED, {
          bookId: bookId,
          currentPage: 1
        }, function (html) {
          if (html.code === 1) {
            layer.msg(html.msg);
            return;
          }
          layer.open({
            title: "资源制作详情",
            type: 1,
            maxmin: false,
            resize: false,
            area: ['1000px', '650px'],
            content: html,
            end: function () {
              layer.closeAll();
            },
            cancel: function () {

            }
          });
        });
      },
      _deleteBookAll = function(bookId){
        var bool = false;
        if (!bool) {
          var url = _conf.URL_DELETE_BOOK;
          url = url.replace("{id}", bookId);
          $.get(url, {}, function (data) {
            console.log("deleteBook:" + data.code + "and msg:" + data.msg)
            if (data.code == 0) {
              layer.msg("已删除");
              setTimeout(function () {
                _refreshCurrentPage();
              }, 500);
            } else if (data.code == 30013 || data.code == 20014) {
              layer.msg('有书本正在训练，暂不能删除书页或更换图片！');
            } else {
              layer.msg(data.msg);
            }
          }).fail(function () {
            layer.msg("删除失败，服务不可用");
          });
          bool = true;
        }
      },
      _deleteBook = function (bookId, state) {
        console.log(bookId + "===" +state);
        var bookSize = 0;
        $.ajaxSetup({async: false});
        $.get(_conf.GET_BOOK_SIZE,{
          bookId: bookId
        },function (data) {
          bookSize = data.data;
          console.log(bookSize);
        });
        $.ajaxSetup({async: true});
        var text = "";
        //防止用户重复点击按钮
        var bool = false;
        //在发布页和其他页删除是给出提示不同
        if(bookSize > 0){
          text = "确定要删除吗？删除后该书将无法被领取";
          var _deleteContent = '<div id = "deleteAllDialog" style= "text-align: center;margin-top: 40px">'
            + '<button type="button" class="btn btn-primary" style="width: 180px;">直接删除</button></div>';
          _deleteContent += '<div id = "replaceAndDeleteDialog" style="text-align: center;margin-top: 30px">'
            + '<button type="button" class="btn btn-primary" style="width: 180px;">替换图片后删除</button></div>';
          layer.open({
            type: 1,
            shade: 0.3,
            title: false,
            area: ['300px', '200px'],
            content: _deleteContent,
            success: function (layero, index) {
              var deleteDom = $(layero);
              var flag = 0;
              //直接删除
              deleteDom.find("#deleteAllDialog").click(function () {
                layer.confirm(text, {
                  btn: ['确定', '取消'] //按钮
                }, function () {
                  //防止连续点击
                  if (flag == 1){
                    return;
                  }
                  flag = 1;
                  _deleteBookAll(bookId);
                });
                layer.close(index);
              });
              //替换图片后删除
              deleteDom.find("#replaceAndDeleteDialog").click(function () {
                layer.close(index);
                var content = $("#replaceBookDiv").html();
                layer.open({
                  title: "替换书本",
                  type: 1,
                  resize: false,
                  scrollbar: false,
                  move: false,
                  area: ['350px', '160px'],
                  content: content,
                  success: function (replaceLayero, replaceIndex) {
                    var replaceDom = $(replaceLayero);

                    replaceDom.find(".confirm-button").click(function () {
                      var replaceBaseBookId = replaceDom.find("#replaceBookId").val();
                      if (replaceBaseBookId == ""){
                        layer.msg("BookID不能为空，请输入BookID。");
                        return;
                      }
                      var re = /^[0-9]*$/;//判断字符串是否为数字
                      if (!re.test(replaceBaseBookId)) {
                        layer.msg("请输入数字bookId.");
                        return;
                      }
                      if (replaceBaseBookId == bookId){
                        layer.msg("输入的bookId不能与准备删除的bookId一样");
                        return;
                      }
                      $.post(_conf.BOTH_BASE_BOOK_IN_ONE_REPO,{
                        baseBookId: bookId,
                        replaceBookId: replaceBaseBookId
                      },function (response) {
                        if (response.code === 20708){
                            layer.msg(response.msg);
                        }else if (response.code === 1){
                          $.post(_conf.REPLACE_BASE_BOOK,{
                            baseBookId: bookId,
                            replaceBookId: replaceBaseBookId
                          },function (data) {
                            if (data.code==0){
                              layer.closeAll();
                              layer.msg("替换完成");
                              setTimeout(function () {
                                _refreshCurrentPage();
                              }, 500);
                            }else {
                              layer.msg(data.msg);
                            }
                          });
                        }else {
                          layer.open({
                            title: "资源制作详情",
                            type: 1,
                            maxmin: false,
                            resize: false,
                            area: ['1000px', '650px'],
                            content: response,
                            cancel: function () {
                              layer.close(replaceIndex);
                            }
                          });
                        }
                      });
                    });
                    replaceDom.find(".cancel-button").click(function () {
                      layer.closeAll();
                    });
                  }
                });
              });
            },
            cancel: function () {
              layer.close();
            }
          });
        }else {
          text = '确定要删除这本书吗？';
          var flag = 0;
          layer.confirm(text, {
            btn: ['确定', '取消'] //按钮
          }, function () {
            //防止连续点击
            if (flag == 1){
              return;
            }
            flag = 1;
            _deleteBookAll(bookId);
          });
        }
      },
      _showExcelImportDialog = function () {

        var modelId = $("#modelId").val();
        $("#uploadExcelBtn27").hide();
        $("#uploadExcelBtn28").hide();
        $("#uploadExcelBtn29").hide();
        $("#uploadExcelBtn" + modelId).show();

        layer.open({
          title: "批量创建书本信息",
          type: 1,
          area: ["1000px", "760px"],
          content: $('#excelImport'),
          cancel: function () {
            $("div.layui-layer-content i.layui-table-tips-c").remove();
            $("div.layui-table-tips-main").remove();
            _root.find("#excelImport").css("display", "none");
            _refreshCurrentPage();
          },
          btn: ["刷新"],
          yes: function (index, layero) {
            _renderHistory();
          }
        })
      }
      ,
      _createBook = function () {
        var modelId = $("#modelId").val();
        if (isNotNull(modelId)) {
          _bookState = 0;
          _showCreateBookPage(modelId, -1, false, _moduleValue, _bookState,
              _bookInfoState);
        }
      },
      _showCreateBookPage = function (modelId, bookId, isExamine, moduleValue,
          bookState, _bookInfoState) {
        var title = bookId > 0 ? "编辑书本" : "创建书本信息";
        $.post(_conf.addBookPage, {
          modelId: modelId,
          bookId: bookId,
          examine: isExamine,
          moduleValue: moduleValue,
          bookState: bookState,
          bookInfoState: _bookInfoState
        }, function (html) {
          layer.open({
            title: title,
            type: 1,
            maxmin: false,
            resize: false,
            area: ['900px', '770px'],
            content: html,
            end: function () {
              setTimeout(() => {
                _openCreateBook = true;
                wantong.base.booklist.search.refreshCurrentPage(modelId, true);
              }, 1000);
            },
            cancel: function () {
              if (_currentTab == _root.makingBookList) {
                wantong.base.bookAdd.showSaveBookMessageHintFrame(false);
                return false;
              }
              wantong.base.booklist.search.refreshEvent();
            },
            success: function () {
              $("#searchTermsBase").unbind();
            }
          });
        });

      },
      _initExcelImportDialog = function () {
        layui.use('upload', function () {
          var upload = layui.upload;

          //执行实例
          let config = {
            elem: '' //绑定元素
              , url: '' //上传接口
              , accept: "file"
              , before: function (obj) { //obj参数包含的信息，跟 choose回调完全一致，可参见上文。
                  layer.msg("文件上传中"); //上传loading
                  setTimeout(function () {
                    _renderHistory();
                  }, 1000)
                }
                , done: function (res) {
                  //上传完毕回调
                  _renderHistory()
                  if (res.code == 0) {
                    layer.msg("文件上传成功");
                  } else if (res.code == 105) {
                    layer.msg(res.data);
                  }

                }
                , error: function () {
                  //请求异常回调
                }
          };

          config.elem = '#uploadExcelBtn27';
          config.url = '/base/excelFile.do?modelId=27';
          upload.render(config);

          config.elem = '#uploadExcelBtn28';
          config.url = '/base/excelFile.do?modelId=28';
          upload.render(config);

          config.elem = '#uploadExcelBtn29';
          config.url = '/base/excelFile.do?modelId=29';
          upload.render(config);
        });
      },
      _renderHistory = function () {
        layui.use('table', function () {
          var table = layui.table;

          table.render({
            elem: '#excelHistory'
            , url: '/base/importHistory' //数据接口
            , page: false //开启分页
            , height: 500
            , cols: [[ //表头
              {
                field: 'filename', title: '文件', width: 250,
                templet: function (d) {
                  return "<img src='/static/images/excel-logo.png' />"
                      + d.filename;
                }
              }
              , {
                field: 'createTime', title: '导入时间', width: 180,
                templet: function (d) {
                  var date1 = new Date(Number(d.createTime));
                  return date1.toLocaleString('chinese',
                      {hour12: false}).replace(/\//g, "-");
                }
              }
              , {
                field: 'admin', title: '导入者账号', width: 220,
                templet: function (d) {
                  return $("#adminemail").text();
                }
              }
              , {
                field: 'state', title: '状态', width: 132,
                templet: function (d) {
                  if (d.state == 0) {
                    return '正在创建';
                  } else if (d.state == 1) {
                    return '全部创建成功';
                  } else if (d.state == 3) {
                    return '<span style="color: red">全部创建失败</span>';
                  } else if (d.state == 2) {
                    return '<span style="color: red">部分创建成功</span>';
                  }
                }
              }
              , {
                field: 'id', title: '操作', width: 145,
                templet: function (d) {
                  if (d.state == 0) {
                    return '<button style="height: 27px;line-height: 27px;color: white;background-color:#999999;" class="layui-btn" disabled>下载详情</button>';
                  } else {
                    return '<button style="height: 27px;line-height: 27px" class="layui-btn layui-btn-normal"><a style="color: white" href="/base/excelFile.do?recordId='
                        + d.id + '">下载详情</a></button>'
                  }
                }
              }

            ]]
          });

        });
      },
      _doCreateTrainTask = function (modelId, imageType, bookId) {
        if (!_openCreateBook) {
          return;
        }
        _openCreateBook = false;
        var taskIdList = new Array();
        console.log(imageType);
        $.ajax({
          url: _conf.createTask + "?modelId=" + modelId + "&trainTypeList="
              + imageType + "&bookId=" + bookId,
          async: false,
          success: function (result) {
            if (result.code == 0) {
              taskIdList = result.data.trainTaskId;
            }
          }
        });
        return taskIdList;
      },

      //找到元素赋值_headerSearchTerms 全部搜索组
      //       _headerSearch  单个搜索
      //       _headerBtnGroup 创建按钮和连接扫码器
      _assignValues = function () {
        // _headerSearchTerms = $("#searchTerms");
        // _headerSearch = $("#search");
        _headerBtnGroup = $("#btnGroup");
        // _headerSearchTerms.css("display", "none");
      },

      //切换头上的按钮显示
      _switchDisplay = function (allSearcTermsShow) {
        if (allSearcTermsShow) {
          // _headerSearchTerms.css("display", "inline");
          // _headerSearch.css("display", "none");
          _headerBtnGroup.css("display", "none");
        } else {
          // _headerSearchTerms.css("display", "none");
          // _headerSearch.css("display", "inline");
          _headerBtnGroup.css("display", "inline");
        }
      },
      isNotNull = function (temp) {
        return !isNull(temp);
      },
      isNull = function (temp) {
        return temp == undefined || temp == ""
      },
      _refreshCurrentPage = function () {
        _currentPage = _currentTab.find('#pagination').attr('currentpage');
        _refreshList(_currentPage);
      },
      validateImage = function (width = 0, height = 0, picker = 'batch', notify = true) {
        /*
         * Sprint8 图片分辨率,比例可配置
         */
        let modelId = Number( document.getElementById('modelId').value );
        let config = JSON.parse( document.getElementById('imageValidationConfig').innerText );
        let sizeConfig = config[`size${modelId}${picker}`];
        let ratioConfig = config[`ratio${modelId}${picker}`];
        console.log(`picker ${picker} 图片尺寸校验配置: sizeConfig[${sizeConfig}], ratioConfig[${ratioConfig}]`);
        console.log(picker);

        if (sizeConfig !== undefined && sizeConfig !== null && sizeConfig !== ''){
          let [minWidth,minHeight] = sizeConfig.split('x').map(e => Number(e));
          if (picker == "a"){
            if (width != minWidth || height != minHeight) {
              if (notify === true){
                layer.msg(`请上传分辨率为 ${sizeConfig}的图片`);
              }
              return false;
            }
          } else {
            if (width < minWidth || height < minHeight) {
              if (notify === true){
                layer.msg(`图片分辨率不能小于 ${sizeConfig}`);
              }
              return false;
            }
          }
        }

        if (ratioConfig !== undefined && ratioConfig !== null && ratioConfig !== ''){
          let ratioArray = ratioConfig.split(' ').map(e=> e.split(':').map(e => Number(e)));
          if (undefined === ratioArray.find(e => width / e[0] === height / e[1])){
            if (notify === true){
              layer.msg(`图片比例不符合要求（${ratioConfig.replace(' ',' 或者 ')}）`);
            }
            return false;
          }
        }

        return true;
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
  return {
    init: function (conf) {
      _init(conf);
    },
    refresh: function (page) {
      _refreshList(page);
    },
    refreshCurrentPage: function () {
      _refreshCurrentPage();
    },
    validateImage,
    bindUploaderValidator
  }
})();
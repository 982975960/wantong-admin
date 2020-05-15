//
wantong.workOrderManager.workOrderBookList = (function () {
  var _conf = {
        LOAD_WORK_ORDER_BOOKS: "/work/loadWorkOrderBooks.do",
        DELETE_WORK_ORDER_BOOK: "/work/deleteWorkOrderBook.do",
        CREATE_WORK_ORDER_BOOK: "/work/createWorkOrderBook.do",
        UPDATE_WORK_ORDER_BOOK: "/work/updateWorkOrderBook.do",
        LOAD_WORK_ORDER_BOOK: "/work/loadOneWorkOrderBook.do",
        OPEN_BATCH_PANEL: "/work/batchPanel.do",
        BATCH_INSERT_BOOK: "/work/baseBookInfos.do",
        BOOK_CHECK_URL: "/work/bookCheck.do",
        URL_LIST_PAGE: "/base/listPages.do"
      },
      //用于保存和更新使用的对象
      _workOrderBookInfoVO = {
        id: 0,
        isbn: "",
        name: "",
        author: "",
        publisher: "",
        seriesTitle: "",
        state: 100,
        modelId: 0,
        workOrderId: 0
      },
      _root = null,
      _createAndUpdateLayerIndex = null,
      _batchWorkOrderBookLayerIndex = null,
      _uploader = null,
      _itemTemplateHtml = null,
      _rowTemplateHtml = null,
      _workOrderBookId = null,
      _obj = null,
      _type = 0,
      _waitIndex = 0,
      _init = function (conf) {
        $.extend(_conf, conf);
        _root = _conf.currentTab;
        //设置工单ID
        _workOrderBookInfoVO.workOrderId = _conf.workOrderId;
        _workOrderBookInfoVO.modelId = parseInt(_conf.modelId);

        _clearParameters();
        _initWorkOrderBookList();
        _initBtnEvent();
      },
      _initWorkOrderBookList = function () {
        _refreshList();
      },

      //给按钮绑定事件
      _initBtnEvent = function () {
        _root.off("click", ".eidt_work_order_book").on("click",
            ".eidt_work_order_book", function () {
              var id = parseInt($(this).attr("tid"));
              $.get(_conf.LOAD_WORK_ORDER_BOOK, {
                isCreate: false,
                id: id
              }, function (data) {
                _createAndUpdateBookMessage(false, data);
              });
            });
        _root.off("click", ".delete_work_order_book").on("click",
            ".delete_work_order_book", function () {
              var id = parseInt($(this).attr("tid"));
              _deleteWorkOrderBookHint(id);
            });
        //添加书本信息的按钮
        _root.off("click", "#addOneWorkOrderBook").on("click",
            "#addOneWorkOrderBook",
            function () {
              $.get(_conf.LOAD_WORK_ORDER_BOOK, {
                isCreate: true
              }, function (data) {

                _createAndUpdateBookMessage(true, data);
              });
            });
        //批量导入书本信息的按钮
        _root.off("click", "#batchWorkOrderBooks").on("click",
            "#batchWorkOrderBooks",
            function () {
              _batckBookMessage();
            });
        //选择书本列表状态select
        _root.off("change", "#state").on("change", "#state", function () {
          _refreshList();
        });

        _root.off("click","#workOrderSearchBtn").on("click","#workOrderSearchBtn",function () {
          //防止连续点击
          var thisBtn = $(this);
          thisBtn.blur();
          var nowTime = new Date().getTime();
          var clickTime = thisBtn.attr("ctime");
          if (clickTime != 'undefined' && (nowTime - clickTime
            < 2000)) {
            return false;
          } else {
            thisBtn.attr("ctime", nowTime);
          }
          _refreshList(1);
        });
        _root.off("click","#workOrderClearBtn").on("click","#workOrderClearBtn",function () {
          _clearParameters();
        });

        _root.off("keyup",".work-con").on("keyup",".work-con",function (event) {
          if(event.keyCode ==13){
            _root.find("#workOrderSearchBtn").click();
          }
        });
      },
      _clearParameters = function () {
        _root.find("#name").val("");
        _root.find("#isbn").val("");
        _root.find("#author").val("");
        _root.find("#publisher").val("");
        _root.find("#seriesTitle").val("");
        _root.find("#innerId").val("");
      },
      //人工查重功能
      _searchRepeat = function (page, obj, type) {
        if (obj == undefined) {
          obj = _obj;
        }
        if (page == undefined) {
          page = 1;
        }

        if (type == undefined) {
          type = _type;
        }

        _type = type;

        var data = _setWorkOrderBookParam(obj);

        if (_isAllNull(data)) {
          layer.msg("请输入书本信息");
          return;
        }
        var isbn = data.isbn;
        var name = data.name;
        if (isbn == "" || name == "") {
          layer.msg("只支持ISBN和书名的查重");
          return;
        }

        $.get(_conf.BOOK_CHECK_URL, {
          id: _workOrderBookId,
          isbn: isbn,
          name: name,
          modelId: _conf.modelId,
          page: page,
          tabType: type,
          type: 0
        }, function (data) {
          console.log("2222222");
          var jqObj = $(data);
          var pagination = jqObj.find("#pagination2");
          if (pagination.length > 0) {
            //初始化分页
            _initCheckPagination(pagination);
          }
          //  data 是内容

          obj.find(".layui-layer-page").css("top", "225px");
          obj.find(".layui-layer-content").css("height", "auto");
          obj.find("#work_order_book_repeat").html(jqObj);
          if (type == 0) {
            obj.find("#isbnSameTab").css("background", "white");
            obj.find("#nameSameTab").css("background", "none");
          } else {
            obj.find("#isbnSameTab").css("background", "none");
            obj.find("#nameSameTab").css("background", "white");
          }
          _initRepeatPanelEvent(obj);
        });
        $(".layui-layer-page").css("top", "1%");
      },

      _isAllNull = function (data) {
        if (data.author == "" && data.isbn == ""
            && data.name == "" && data.publisher == "" && data.seriesTitle
            == "") {

          return true;
        } else {
          return false
        }
      },
      //查重界面的tab
      _initRepeatPanelEvent = function (obj) {
        obj.off("click", "#isbnSameTab").on("click",
            "#isbnSameTab", function () {
              //防止连续点击
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

              _searchRepeat(1, obj, 0);
              _root.find("#isbnSameTab").css("background", "white");
              _root.find("#nameSameTab").css("background", "none");
            });
        obj.off("click", "#nameSameTab").on("click",
            "#nameSameTab", function () {
              //防止连续点击
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

              _searchRepeat(1, obj, 1);
              _root.find("#isbnSameTab").css("background", "none");
              _root.find("#nameSameTab").css("background", "white");
            });
        obj.off("click", "#openBook").on("click",
            "#openBook", function () {
              //防止连续点击
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

              var bookId = $(this).attr("bookId");
              _showPageInfo(bookId, obj);
            });
      },
      //批量上传的按钮
      _batckBookMessage = function () {
        $.get(_conf.OPEN_BATCH_PANEL, {}, function (data) {
          var content = data;
          _batchWorkOrderBookLayerIndex = layer.open({
            title: "批量导入书本信息",
            type: 1,
            shade: 0.2,
            area: ['500px', '200px'],
            content: content,
            end: function () {

            }, cancel: function () {

            }, success: function () {
              _createUploader();
            }
          });
        });
      },
      _createUploader = function () {
        _uploader = WebUploader.create({
          swf: GlobalVar.contextPath + '/js／uploader/Uploader.swf',
          server: _conf.BATCH_INSERT_BOOK + "?modelId=" + _conf.modelId
              + "&workOrderId=" + _conf.workOrderId,
          pick: {
            id: changeFileBtn,
            multiple: false,
          },
          accept: {
            title: 'excel',
            extensions: 'xlsx',
            mimeTypes: 'application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          },
          auto: true,
          duplicate: true,
          async: false,
          method: "POST"
        })
        _uploadEvent();
      },
      _uploadEvent = function () {
        _uploader.on("uploadSuccess", function (file, response) {
            layer.close(_batchWorkOrderBookLayerIndex);
          _showWaitPanel();
          if (response.code == 0) {
            layer.msg("导入成功");
            _refreshCurrentPage();

          } else {
            layer.msg(response.data);
          }
          _uploader.reset();
        });

        _showWaitPanel = function () {
          _waitIndex = layer.msg('正在导入中，请稍等....', {
            icon: 16
            , shade: 0.4,
            time: -1
          });
        },

        _uploader.on("error", function (type) {
          if (type == "F_EXCEED_SIZE") {
            layer.msg("")
          } else if (type == "Q_TYPE_DENIED") {
            layer.msg("文件格式错误");
            _uploader.reset();
          } else {

          }
        });
      },
      _deleteWorkOrderBookHint = function (id) {
        var isClick = false;
        var index = layer.confirm('你确认删除这条书本信息吗？', {
          btn: ['确认', '取消']
        }, function () {
          if (!isClick) {

            isClick = true;
            $.get(_conf.DELETE_WORK_ORDER_BOOK, {
              id: id
            }, function (data) {
              if (data.code == 0) {
                layer.msg("删除成功");

                _refreshCurrentPage();
              } else {
                layer.msg(data.msg);
              }
              layer.close(index);
            })
          }
        }, function () {
          layer.close(index);
        });
      },
      //书本信息的layer
      _createAndUpdateBookMessage = function (isCreate, obj) {
        var content = obj;
        _createAndUpdateLayerIndex = layer.open({
          title: isCreate ? "添加任务" : "编辑任务",
          type: 1,
          shade: 0.2,
          area: ['980px', 'auto'],
          content: content,
          move: true,
          end: function () {

          }, cancel: function () {

          }, success: function (layero) {
            _createAndUpdateBtnEvent(isCreate, $(layero));
          }
        })
      },
      //创建个更新界面的按钮事件
      _createAndUpdateBtnEvent = function (isCreate, obj) {
        var flag = 0;
        obj.find(".confirm-button").off("click").on("click", function () {
          //防止重复点击
          if (flag == 1){
            return
          }
          if (isCreate) {
            flag = 1;
            _createOneBook(obj);
          } else {
            flag = 1;
            _updateOneBookMessage(obj, parseInt($(this).attr("tid")));
          }
        });
        obj.find(".cancel-button").off("click").on("click", function () {
          layer.close(_createAndUpdateLayerIndex);
        });
        obj.find(".state-select").off("change").on("change", function () {
          var _state = $(this).val();
          console.log("state:" + _state);
          if (_state == 13) {
            layer.prompt({
              formType: 2,
              value: '',
              btn: ['保存', '取消'],
              resize: false,
              title: '请备注原因',
              maxlength: 50,
              area: ['400px', '150px'],
              success: function () {
                $(".layui-layer-input").attr("placeholder", "不超过50个字");
                $(".layui-layer-input").css("resize", "none");
              }
            }, function (value, index, elem) {
              if (value.length == 0) {
                layer.msg("请输入备注内容");
                return;
              }
              if (value.length > 50) {
                layer.msg("备注长度不能大于50");
                return;
              }
              layer.close(index);
              obj.find("#remark").html(value);
              obj.find("#remark").attr("title", value);
            });

          }
        });
        //人工查重的按钮
        obj.find("#search_repeat").off("click").on("click",
            function () {
              var id = $(this).attr("tid");
              _workOrderBookId = id;
              _obj = obj;
              _type = 0;
              _searchRepeat(1, obj, 0);
            });
      },
      //创建单条数据
      _createOneBook = function (obj) {
        var data = _setWorkOrderBookParam(obj);
        console.log("243141412412");

        if (data.isbn == "") {
          layer.msg("ISBN不能为空");
          return;
        }
        if (data.isbn.length != 10 && data.isbn.length != 13) {
          layer.msg("非法isbn");
          return;
        }
        if (data.name == ""  || data.name.trim() == "") {
          layer.msg("书名不能为空");
          return;
        }
        if (data.author == "" || data.author.trim() == "") {
          layer.msg("作者不能为空");
          return;
        }
        if (data.publisher == "" || data.publisher.trim() == "" ) {
          layer.msg("出版社不能为空");
          return;
        }
        if (data.state == 100) {
          layer.msg("书本状态异常");
          return;
        }
        if (data.workOrderId == 0) {
          layer.msg("表单ID为空");
          return;
        }
        if (data.modelId == 0) {
          layer.msg("基础ID为空");
          return;
        }
        if (data.state == 13 && data.remark == "") {
          layer.msg("请输入备注");
          return;
        }
        $.ajax({
          url: _conf.CREATE_WORK_ORDER_BOOK,
          type: 'POST',
          async: true,
          contentType: "application/json",
          data: JSON.stringify(data),
          dataType: 'json',
          success: function (data) {
            if (data.code == 0) {
              layer.msg("创建成功");
              layer.close(_createAndUpdateLayerIndex);
              //更新当前列表
              _refreshCurrentPage();
            } else {
              layer.msg(data.msg);
            }
          }, error: function () {
            layer.msg("服务异常")
          }
        });
      },
      //更新一条数据
      _updateOneBookMessage = function (obj, id) {
        var data = _setWorkOrderBookParam(obj);
        data.id = id;
        if (data.isbn == "") {
          layer.msg("ISBN不能为空");
          return;
        }
        if (data.isbn.length != 10 && data.isbn.length != 13) {
          layer.msg("非法isbn");
          return;
        }
        if (data.name == "" || data.name.trim() == "") {
          layer.msg("书名不能为空");
          return;
        }
        if (data.author == "" || data.author.trim() == "") {
          layer.msg("作者不能为空");
          return;
        }
        if (data.publisher == "" || data.publisher.trim() == "") {
          layer.msg("出版社不能为空");
          return;
        }
        if (data.state == 100) {
          layer.msg("书本状态异常");
          return;
        }
        if (data.workOrderId == 0) {
          layer.msg("表单ID为空");
          return;
        }
        if (data.modelId == 0) {
          layer.msg("基础ID为空");
          return;
        }
        if (data.id == 0) {
          layer.msg("id不能为0");
        }
        $.ajax({
          url: _conf.UPDATE_WORK_ORDER_BOOK,
          type: 'POST',
          async: true,
          contentType: "application/json",
          data: JSON.stringify(data),
          dataType: 'json',
          success: function (data) {
            if (data.code == 0) {
              layer.msg("已保存");
              layer.close(_createAndUpdateLayerIndex);
              //更新当前列表
              _refreshCurrentPage();
            } else {
              layer.msg(data.msg);
            }
          }, error: function () {
            layer.msg("服务器异常");
          }
        })

      },
      //设置参数
      _setWorkOrderBookParam = function (obj) {
        var isbn = obj.find("#isbn").val();
        var name = obj.find("#bookName").val();
        var author = obj.find("#author").val();
        var publisher = obj.find("#publisher").val();
        var seriesTitle = obj.find("#seriesTitle").val();
        var remark = obj.find("#remark").html();
        var state = 100;
        if (obj.find(".state-select").length > 0) {
          state = parseInt(
              obj.find(".state-select").find('option:selected').val());
        } else {
          state = parseInt(obj.find("#state").attr("tid"));
        }
        var vo = clone(_workOrderBookInfoVO);
        vo.isbn = isbn;
        vo.name = name;
        vo.author = author;
        vo.publisher = publisher;
        vo.seriesTitle = seriesTitle;
        vo.state = state;
        vo.remark = remark;

        return vo;
      },
      //刷新当前页
      _refreshCurrentPage = function () {
        //获得当前页的页码
        var currentPage = _root.find("#pagination").attr("currentpage");
        //刷新页
        _refreshList(currentPage);
      },
      //刷新的实现
      _refreshList = function (page) {
        if (page == undefined) {
          page = 1;
        }
        var state = 0;
        if (_root.find("#state").find('option:selected').length > 0) {
          state = parseInt(
              _root.find("#state").find('option:selected').val());
        } else {
          state = 100;
        }
        var searchVO = _loadParameters(page,state);

        $.ajax({
          url:_conf.LOAD_WORK_ORDER_BOOKS,
          type:'POST',
          async:false,
          data:JSON.stringify(searchVO),
          contentType: "application/json; charset=utf-8",
          success:function (data) {
            var jqObj = $(data);

            var pagination = jqObj.find("#pagination");
            if (pagination.length > 0) {
              //初始化分页
              _initPagination(pagination);
            }
            //将对象内容放入界面
            _root.html(jqObj);
          }
        });

      },
    _loadParameters = function (page,state) {
      var name = _root.find("#name").length != 0 ? _root.find(
        "#name").val() : "";
      var isbn = _root.find("#isbn").length != 0 ? _root.find(
        "#isbn").val() : "";
      var author = _root.find("#author").length != 0 ? _root.find(
        "#author").val() : "";
      var publisher = _root.find("#publisher").length != 0 ? _root.find(
        "#publisher").val() : "";
      var seriesTitle = _root.find("#seriesTitle").length != 0
        ? _root.find("#seriesTitle").val() : "";
      var innerId = _root.find("#innerId").length != 0 ? _root.find("#innerId").val(): 0;

      return {
        name: name,
        isbn: isbn,
        author: author,
        publisher: publisher,
        seriesTitle: seriesTitle,
        innerId: parseInt(innerId),
        workOrderName: _conf.workOrderName,
        workOrderId: parseInt(_conf.workOrderId),
        state: state,
        currentPage: page
      }
    },
      _showPageInfo = function (bookId, obj) {
        $.get(_conf.URL_LIST_PAGE + "?bookId=" + bookId,
            {},
            function (data) {
              if (data.code == 0) {
                var _pages = data.data.pages;
                layer.open({
                  title: "书页详情",
                  type: 1,
                  scrollbar: true,
                  area: ['500px', '600px'],
                  content: obj.find("#template").html(),
                  end: function () {

                  },
                  cancel: function () {

                  },
                  success: function (layero) {

                    var mask = $(".layui-layer-shade");
                    mask.appendTo(layero.parent());
                    //其中：layero是弹层的DOM对象

                    _itemTemplateHtml = $(layero).find("#itemTemplate").prop(
                        'outerHTML');
                    _rowTemplateHtml = "<div class=\"page-list-row\"></div>";
                    _render(_pages, bookId, $(layero));
                  }
                });

              }

            });
      },

      _render = function (pages, bookId, obj) {
        var pageType = ["封面", "封里", '扉页', '目录', '正文', '辅文', '封底里', '封底',
          '其它'];
        var size = pages.length;
        var rows = size / 6;
        if (size % 6 > 0) {
          rows++;
        }
        for (var i = 0; i < rows; i++) {
          var row = $(_rowTemplateHtml);
          for (var j = 0; j < 6; j++) {
            var itemIndex = i * 6 + j;
            if (itemIndex < size) {
              var bookId = pages[itemIndex].baseBookId;
              var coverImage = pages[itemIndex].imageId.indexOf(".jpg")
              == -1
                  ? pages[itemIndex].imageId + ".jpg"
                  : pages[itemIndex].imageId;
              var index = pages[itemIndex].pageType;
              var modelId = pages[itemIndex].modelId;
              if (index > 0) {
                index--;
              } else if (index == -1) {
                index = 8;
              }
              var paginationText = pageType[index] + " - 第"
                  + pages[itemIndex].pagination + "页";
              /*var paginationText = pages[itemIndex].physicalIndex;
              if (pages[itemIndex].physicalState != 0) {
                paginationText += (' - ' + pages[itemIndex].physicalState);
              }*/
              var newNode = $(_itemTemplateHtml);
              newNode.show();
              newNode.find("#thumbnail").find("img").attr("src",
                  GlobalVar.services.FDS + GlobalVar.services.BOOKIMAGEPATH
                  + "/" + modelId
                  + "/" + bookId
                  + "/" + coverImage);
              newNode.find("#paginationText").text(paginationText);
              row.append(newNode);
            }
          }
          if (row.length > 0) {
            obj.find("#bookPageInfoIDiv").append(row);
          }
        }
      },
      //初始化分页
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
      _initCheckPagination = function (paginationDom) {
        var currentPage = parseInt(paginationDom.attr("currentPage"));
        var totalPages = parseInt(paginationDom.attr("pages"));
        //初始化页码
        paginationDom.html('');
        if (0 == totalPages) {
          return;
        } else {
          var lastPageAppend = 0;
          for (var i = 1; i < totalPages + 1; i++) {
            if (totalPages > 4 && Math.abs(currentPage - i) > 1 && i != 1
                && i
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
                  '<li class="page-back-b2" page="' + i + '"><a href="#">'
                  + i
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
          if (jumpPage2 != NaN && jumpPage2 > 0 && jumpPage2
              <= totalPages) {
            $("html,body").animate({scrollTop: 0}, 10);
            _searchRepeat(jumpPage2);
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
              _searchRepeat(prevPage);
            }
          } else if (page == "0") {
            var nextPage = currentPage + 1;
            if (nextPage <= totalPages) {
              _searchRepeat(nextPage);
            }
          } else {
            if (page != undefined) {
              _searchRepeat(page);
            }
          }
        });
      },

      clone = function (obj) {
        var o, obj;
        if (obj.constructor == Object) {
          o = new obj.constructor();
        } else {
          o = new obj.constructor(obj.valueOf());
        }
        for (var key in obj) {
          if (o[key] != obj[key]) {
            if (typeof (obj[key]) == 'object') {
              o[key] = clone(obj[key]);
            } else {
              o[key] = obj[key];
            }
          }
        }
        o.toString = obj.toString;
        o.valueOf = obj.valueOf;
        return o;
      };

  return {
    init: function (conf) {
      _init(conf);
    }
  }
})();
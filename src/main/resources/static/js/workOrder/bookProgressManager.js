wantong.base = {};
wantong.bookProgressManager = (function () {
      var _conf = {
            LOAD_LIST_URL: "/work/bookProgressManager.do",
            BOOK_CHECK_URL: "/work/bookCheck.do",
            URL_LIST_PAGE: "/base/listPages.do",
            DOWNLOAD_EXCEL_URL: "/work/download.do",
            LOAD_SEARCHDOM_URL: "/work/bookProgressSearch.do",
            CHANGE_BOOK_STATE_URL: "/work/updateWorkState.do",
            CREATE_BOOK_URL: "/work/create.do",
            SET_SAME_BOOK_URL: "/work/setSameBook.do",
            SET_SAME_TASK_URL: "/work/setSameTask.do",
            LOAD_TASK_INFO_URL: "/work/loadTaskCheckInfo.do",
            ADD_BOOK_ISBN: "/work/addBookIsbn.do",
            OPEN_EDIT_BOOK_PROGRESS: "/work/openEditBookProgress.do",
            EDIT_BOOK_PROGRESS: "/work/editBookProgress.do",
            SHOW_EDIT_BASE_BOOK: "work/showEditBaseBook.do",
            BATCH_CREATE_BOOK: "/work/batchCreateBook.do",
            BATCH_UPDATE_STATE: "/work/batchUpdateState.do",
            CHECK_BATCH_TASK: "/work/checkBatchTask.do"
          },
          _root = null,
          _bookProgressId = null,
          _isbn = null,
          _name = null,
          _checkType = 0,
          _itemTemplateHtml = "",
          _rowTemplateHtml = "",
          _index = null,
          _indexPatch = null,
          _batchUpdateStateIndex = null,
          _isShow = false,
          _init = function (conf) {
            console.log("33333");
            $.extend(_conf, conf);
            _root = _conf.currentTab;
            _initSearchDom();
            _initButton();
            _initSelect();
          },
          _initSearchDom = function () {
            console.log("modelId:" + _conf.modelId);
            $.get(_conf.LOAD_SEARCHDOM_URL, {
                  modelId: _conf.modelId
                },
                function (data) {
                  var dom = $(data);
                  _root.html(dom);
                  _initWorkOrderSelect();
                  _initParameters();
                  _refreshList();
                  _initLeadBtn();
                }
            );
          },
        _getBookMessage= function (obj,id) {
          var isbn = obj.find("#isbn").val();
          var name = obj.find("#bookName").val();
          var author = obj.find("#author").val();
          var publisher = obj.find("#publisher").val();
          var seriesTitle = obj.find("#seriesTitle").val();

          return {
            id:id,
            isbn:isbn,
            name:name,
            author:author,
            publisher:publisher,
            seriesTitle:seriesTitle
          }
        },
        _editBookProgress = function (obj, id) {
          obj.find(".cancel-button").off("click").on("click", function () {
            layer.close(_index);
          });
          obj.find(".confirm-button").off("click").on("click", function () {
            var data = _getBookMessage(obj, id);
            if (data.isbn === "") {
              layer.msg("ISBN不能为空");
              return;
            }
            if (data.isbn.length !== 10 && data.isbn.length !== 13) {
              layer.msg("非法isbn");
              return;
            }
            if (data.name === "") {
              layer.msg("书名不能为空");
              return;
            }
            if (data.author === "") {
              layer.msg("作者不能为空");
              return;
            }
            if (data.publisher === "") {
              layer.msg("出版社不能为空");
              return;
            }
            $.ajax({
              url: _conf.EDIT_BOOK_PROGRESS,
              type: 'POST',
              async: true,
              contentType: "application/json",
              data: JSON.stringify(data),
              dataType: 'json',
              success: function (data) {
                if (data.code == 0) {
                  layer.msg("修改任务信息成功");
                  setTimeout(function () {
                    layer.close(_index);
                  }, 500);
                  //更新当前列表
                  var num = $("#pagination").attr("currentPage");
                  _refreshList(parseInt(num));
                } else {
                  layer.msg(data.msg);
                }
              },
              error: function () {
                layer.msg("服务器异常");
              }
            })
          });
        },
          _initButton = function () {
            _root.off("click",".editBaseBook").on("click",".editBaseBook",function () {
              var bookId = $(this).attr("bookId");
              var bookType = $(this).attr("bookType");
              $.post(_conf.SHOW_EDIT_BASE_BOOK, {
                bookId: bookId,
                bookType: bookType
              }, function (html) {
                layer.open({
                  title: "编辑书本",
                  type: 1,
                  maxmin: false,
                  resize: false,
                  area: ['900px', '770px'],
                  content: html,
                  end: function () {
                    layer.closeAll();
                  },
                  cancel: function () {
                    _refreshList($("#pagination").attr("currentPage"));
                  },
                  success: function (layero) {
                    var mask = $(".layui-layer-shade");
                    mask.appendTo(layero.parent());
                    //其中：layero是弹层的DOM对象
                  }
                });
              });

            });
            _root.off("click",".editBookProgress").on("click",".editBookProgress",function () {
              var id = $(this).attr("bookProgressId");
              $.get(_conf.OPEN_EDIT_BOOK_PROGRESS,{id:id},function (data) {
                _index = layer.open({
                  title: "编辑信息",
                  type: 1,
                  maxmin: false,
                  area: ['800px', 'auto'],
                  content: data,
                  move: true,
                  end: function () {

                  },
                  cancel: function () {
                    layer.closeAll();
                  },
                  success: function (layero) {
                    $(layero).find(".layui-layer-content").css("height","");
                    _editBookProgress($(layero),id);
                  }
                });
              });
            });
            _root.off("click", "#checkBookBtn").on("click",
                "#checkBookBtn", function () {
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
                  var bookProgressId = $(this).attr("bookProgressId");
                  var isbn = $(this).attr("isbn");
                  var name = $(this).attr("bookProgressName");
                  _bookProgressId = bookProgressId;
                  _isbn = isbn;
                  _name = name;
                  _loadCheckTaskInfo(bookProgressId);
                  _refreshCheckList(1, isbn, name, 0);
                  layer.open({
                    title: "人工审核",
                    type: 1,
                    scrollbar: true,
                    move: false,
                    area: ['1000px', '700px'],
                    content: _root.find("#bookProgressCheckDiv"),
                    end: function () {
                      _refreshCurrentList();
                    },
                    cancel: function () {

                    },
                    success: function (layero) {
                      var mask = $(".layui-layer-shade");
                      mask.appendTo(layero.parent());
                      //其中：layero是弹层的DOM对象
                    }
                  });
                  _index = layer.index;
                });
            _root.off("click", "#createBookBtn").on("click",
                "#createBookBtn", function () {
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

                  var _this = $(this);
                  var id = _this.attr("bookProgressId");
                  _createBook(id);
                });
            _root.off("click", "#isbnSameTab").on("click",
                "#isbnSameTab", function () {
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

                  _refreshCheckList(1, _isbn, _name, 0);
                  _root.find("#isbnSameTab").css("background", "white");
                  _root.find("#nameSameTab").css("background", "none");
                });
            _root.off("click", "#nameSameTab").on("click",
                "#nameSameTab", function () {
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

                  _refreshCheckList(1, _isbn, _name, 1);
                  _root.find("#isbnSameTab").css("background", "none");
                  _root.find("#nameSameTab").css("background", "white");
                });

            _root.off("click", "#openBook").on("click",
                "#openBook", function () {
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

                  var bookId = $(this).attr("bookId");
                  _showPageInfo(bookId);
                });
            _root.off("click", "#searchBtn").on("click",
                "#searchBtn", function () {
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
            _root.off("click", "#clearBtn").on("click",
                "#clearBtn", function () {
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

                  _clearParameters();
                });
            _root.off("click", "#leadOutExcelBtn").on("click",
                "#leadOutExcelBtn", function () {
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

                  var pageCount = _root.find("#pagination").attr("pages");
                  var pageSize = _root.find("#pagination").attr("pagesize");
                  if ((pageCount - 1) * pageSize > 15000) {
                    layer.msg("只能导出小于15000条的数据");
                    return;
                  }
                  _downloadExcel();
                });
            _root.off("click", "#batchCreateBookBtn").on("click",
              "#batchCreateBookBtn", function () {
                //防止连续点击
                var thisBtn = $(this);
                thisBtn.blur();
                var nowTime = new Date().getTime();
                var clickTime = thisBtn.attr("ctime");
                if (clickTime != 'undefined' && (nowTime - clickTime
                  < 3000)) {
                  return false;
                } else {
                  thisBtn.attr("ctime", nowTime);
                }

                var workOrderId = _root.find("#workOrderSelect").val();
                _indexPatch = layer.msg('批量创建书本中...', {icon: 16,shade: [0.5, '#f5f5f5'],scrollbar: false,offset: 'auto', time: 1000000});
                $.post(_conf.BATCH_CREATE_BOOK,{
                  workOrderId: workOrderId
                },function (data) {
                  if (data.code == 0){
                    var count = 0;
                    var interval = setInterval(function () {
                      $.post(_conf.CHECK_BATCH_TASK,{
                        workOrderId: workOrderId,
                        state: 2
                      },function (data) {
                        if (data.data == 0){
                          layer.close(_indexPatch);
                          layer.msg("批量创建书本完成");
                          clearInterval(interval);
                          _refreshList($("#pagination").attr("currentPage"));
                        }else {
                          count++;
                          if (count > 600){
                            layer.close(_indexPatch);
                            layer.msg("批量创建书本失败");
                            clearInterval(interval);
                          }
                        }
                      })
                    }, 3000);
                  }else {
                    layer.close(_indexPatch);
                    layer.msg(data.msg);
                  }
                })

              });
            _root.off("change", "#bookStateSelect").on("change",
                "#bookStateSelect", function () {
                  var _this = $(this);
                  $(this).blur();
                  var id = _this.attr("iid");
                  var oldState = _this.attr("state");
                  var newState = _this.val();
                  _changeBookState(id, oldState, newState);
                });
            _root.off("click", "#sameBookBtn").on("click",
                "#sameBookBtn", function () {
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

                  var _this = $(this);
                  var bookId = _this.attr("bookId");
                  var bookName = _this.attr("bookName");
                  _setSameBook(bookId, bookName);
                });

            _root.off("click", "#progressSameBtn").on("click",
                "#progressSameBtn", function () {
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

                  var _this = $(this);
                  var sameBookProgressId = _this.attr("bookprogressid");
                  _setSameTask(sameBookProgressId);
                });

            _root.off("click", "#noSameBtn").on("click",
                "#noSameBtn", function () {
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

                  //未发现相同将书本进度状态改为1 待采购
                  _changeBookState(_bookProgressId, -1, 1);
                });

            _root.off("change", "#sortTypeSelect").on("change",
                "#sortTypeSelect", function () {
                  _refreshList();
                });
            _root.off("keydown", ".work-con").on("keydown", ".work-con",
                function (event) {
                  if (event.keyCode == 13) {
                    _refreshList();
                  }
                });
            _root.off("click", "#showSonTaskBtn").on("click",
                "#showSonTaskBtn", function () {
                  console.log("1231412131");
                  var _this = $(this);
                  var taskId = _this.attr("taskId");
                  var son = $(".son_" + taskId);
                  if (son.css("display") == "none") {
                    son.css("display", "inline");
                    _this.attr("class", "glyphicon glyphicon-minus");
                  } else {
                    son.css("display", "none");
                    _this.attr("class", "glyphicon glyphicon-plus");
                  }
                });
            _root.off("click", "#batchUpdateStateBtn").on("click", "#batchUpdateStateBtn", function () {
                _batchUpdateStateIndex = layer.open({
                title: "批量修改任务状态",
                type: 1,
                move: false,
                area: ['300px', '170px'],
                content: _root.find("#batchUpdateStateDiv"),
                end: function () {
                  layer.close(_batchUpdateStateIndex);
                },
                cancel: function () {

                },
                success: function (layero) {
                  var mask = $(".layui-layer-shade");
                  mask.appendTo(layero.parent());
                  //其中：layero是弹层的DOM对象
                }
              });
            });
            _root.off("click", "#batchUpdateStateCloseBtn").on("click", "#batchUpdateStateCloseBtn", function () {
              layer.close(_batchUpdateStateIndex);
            });
            _root.off("click", "#batchUpdateStateSaveBtn").on("click", "#batchUpdateStateSaveBtn", function () {
              var workOrderId = _root.find("#workOrderSelect").val();
              var oldState = _root.find("#oldStateSelect").val();
              var newState = _root.find("#newStateSelect").val();

              _indexPatch = layer.msg('批量修改任务状态中...', {icon: 16,shade: [0.5, '#f5f5f5'],scrollbar: false,offset: 'auto', time: 1000000});
              $.post(_conf.BATCH_UPDATE_STATE,{
                workOrderId: workOrderId,
                oldState: oldState,
                newState: newState
              },function (data) {
                if (data.code == 0){
                  var countState = 0;
                  var interval = setInterval(function () {
                    $.post(_conf.CHECK_BATCH_TASK,{
                      workOrderId: workOrderId,
                      state: oldState
                    },function (data) {
                      if (data.data == 0){
                        layer.close(_indexPatch);
                        layer.msg("批量修改任务状态完成");
                        clearInterval(interval);

                        layer.close(_batchUpdateStateIndex);
                        _refreshList($("#pagination").attr("currentPage"));
                      }else {
                        countState++;
                        if (countState > 300){
                          layer.close(_indexPatch);
                          layer.msg("批量修改任务状态失败");
                          clearInterval(interval);
                        }
                      }
                    })
                  }, 2000);

                }else {
                  layer.close(_indexPatch);
                  layer.msg(data.msg);
                  layer.close(_batchUpdateStateIndex);
                }
              });
            });
          },
          _refreshList = function (page) {
            if (page == undefined) {
              page = 1;
            }
            var searchVO = _loadParameters();
            $.get(_conf.LOAD_LIST_URL, {
              searchVO: JSON.stringify(searchVO),
              currentPage: page
            }, function (data) {
              //获得返回界面的JQ对象
              var dom = $(data);
              //在界面对象里获得分页对象
              var pagination = dom.find("#pagination");
              //判断分页对象存不存在
              if (pagination.length > 0) {
                //初始化分页
                _initPagination(pagination);
              }
              //将对象内容放入界面
              _root.find("#bookProgressListDiv").html(dom);
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
          _searchIsAllNull = function (obj) {
            if (obj.name == "" && obj.isbn == "" && obj.author == ""
                && obj.publisher == "" && obj.seriesTitle == "" && obj.innerId
                == -1) {
              return true;
            } else {
              return false;
            }
          },
          _loadParameters = function () {
            var modelId = _conf.modelId;
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
            var innerId = _root.find("#innerId").length != 0 ? _root.find(
                "#innerId").val() == "" ? -1 : _root.find("#innerId").val()
                : -1;
            var workOrderId = _root.find("#workOrderSelect").length != 0
                ? _root.find("#workOrderSelect").val() == "" ? -1 : _root.find(
                    "#workOrderSelect").val() : -1;
            var sortType = _root.find("#sortTypeSelect").length != 0
                ? _root.find("#sortTypeSelect").val() : -1;

            var allSelect = _root.find(".select").find(
                "input[type=checkbox]");
            var selectState = [];
            allSelect.each(function () {
              var thisCheckBox = $(this);
              var _state = thisCheckBox.val();
              if (this.checked) {
                selectState.push(_state);
              }
            });

            var bookState = _root.find("#selector").length != 0
                ? selectState : [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

            return {
              modelId: modelId,
              name: name,
              isbn: isbn,
              author: author,
              publisher: publisher,
              seriesTitle: seriesTitle,
              innerId: innerId,
              workOrderId: workOrderId,
              sortType: sortType,
              bookState: bookState
            }
          },
          _clearParameters = function () {
            _root.find("#name").val("");
            _root.find("#isbn").val("");
            _root.find("#author").val("");
            _root.find("#publisher").val("");
            _root.find("#seriesTitle").val("");
            _root.find("#innerId").val("");
          },
          _initParameters = function () {
            _root.find("#name").val("");
            _root.find("#isbn").val("");
            _root.find("#author").val("");
            _root.find("#publisher").val("");
            _root.find("#seriesTitle").val("");
            _root.find("#innerId").val("");
            var allSelect = _root.find("#selector").find(
                "input[type=checkbox]");
            allSelect.prop("checked", true);
          },
          _setParameters = function (searchVO) {
            _root.find("#name").val(searchVO.name);
            _root.find("#isbn").val(searchVO.isbn);
            _root.find("#author").val(searchVO.author);
            _root.find("#publisher").val(searchVO.publisher);
            _root.find("#seriesTitle").val(searchVO.seriesTitle);
            _root.find("#innerId").val(searchVO.innerId);
            _root.find("#sortTypeSelect").val(searchVO.sortType);
            var allSelect = _root.find(".select").find(
                "input[type=checkbox]");
            allSelect.each(function () {
              var thisCheckBox = $(this);
              var _state = thisCheckBox.val();
              if (searchVO.bookState.concat(_state)) {
                thisCheckBox.prop("checked", true);
              }
            });
          },
          _refreshCheckList = function (page, isbn, name, type) {
            if (page == undefined) {
              page = 1;
            }
            if (type == undefined) {
              type = _checkType;
            }
            if (isbn == undefined) {
              isbn = _isbn;
            }
            if (name == undefined) {
              name = _name;
            }

            _checkType = type;
            var modelId = _conf.modelId;
            $.get(_conf.BOOK_CHECK_URL, {
              id: _bookProgressId,
              isbn: isbn,
              name: name,
              modelId: modelId,
              page: page,
              tabType: type,
              type: 1
            }, function (data) {
              //获得返回界面的JQ对象
              var dom = $(data);
              //在界面对象里获得分页对象
              var pagination = dom.find("#pagination2");
              //判断分页对象存不存在
              if (pagination.length > 0) {
                //初始化分页
                _initCheckPagination(pagination);
              }
              //将对象内容放入界面
              _root.find("#bookProgressCheckDiv").find("#checkDiv").html(dom);
              if (type == 0) {
                _root.find("#isbnSameTab").css("background", "white");
                _root.find("#nameSameTab").css("background", "none");
              } else {
                _root.find("#isbnSameTab").css("background", "none");
                _root.find("#nameSameTab").css("background", "white");
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
                _refreshCheckList(jumpPage2);
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
                  _refreshCheckList(prevPage);
                }
              } else if (page == "0") {
                var nextPage = currentPage + 1;
                if (nextPage <= totalPages) {
                  _refreshCheckList(nextPage);
                }
              } else {
                if (page != undefined) {
                  _refreshCheckList(page);
                }
              }
            });
          },
          _showPageInfo = function (bookId) {
            $.get(_conf.URL_LIST_PAGE + "?bookId=" + bookId,
                {},
                function (data) {
                  _renderClear();
                  if (data.code == 0) {
                    var _pages = data.data.pages;
                    layer.open({
                      title: "书页详情",
                      type: 1,
                      scrollbar: true,
                      area: ['500px', '600px'],
                      content: _root.find("#bookPageInfoIDiv"),
                      end: function () {

                      },
                      cancel: function () {

                      },
                      success: function (layero) {
                        var mask = $(".layui-layer-shade");
                        mask.appendTo(layero.parent());
                        //其中：layero是弹层的DOM对象
                      }
                    });
                    _itemTemplateHtml = _root.find("#itemTemplate").prop(
                        'outerHTML');
                    _rowTemplateHtml = "<div class=\"page-list-row\"></div>";
                    _render(_pages, bookId);
                  }
                });
          },
          _renderClear = function () {
            _root.find("#bookPageInfoIDiv").children().each(function () {
              if ($(this).attr("id") != "itemTemplate") {
                $(this).remove();
              }
            });
          },
          _render = function (pages) {
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
                _root.find("#bookPageInfoIDiv").append(row);
              }
            }
          },
          _initSelect = function () {
            _root.off("click", "#selector").on("click",
                "#selector", function (eve) {
                  eve.stopPropagation();
                });
            _root.off("click", "#selector .mr-selector").on("click",
                "#selector .mr-selector", function (eve) {
                  _isShow = !_isShow;
                  console.log("isShow:" + _isShow);
                  $("#selector .img-selector").css("background", _isShow
                      ? "url(static/images/ico6_1.png) no-repeat 97% center transparent"
                      : "url(static/images/ico6.png) no-repeat 97% center transparent");
                  $("#selector .select").toggle();
                });
            _root.off("click", "#selector .img-selector").on("click",
                "#selector .img-selector", function (eve) {
                  _isShow = !_isShow;
                  $("#selector .img-selector").css("background", _isShow
                      ? "url(static/images/ico6_1.png) no-repeat 97% center transparent"
                      : "url(static/images/ico6.png) no-repeat 97% center transparent");
                  console.log("isShow:" + _isShow);
                  $("#selector .select").toggle();
                });
            _root.off("click", "input[type=checkbox]").on("click",
                "input[type=checkbox]", function () {
                  var _this = $(this);
                  var state = _this.val();
                  if (state == -1) {
                    if (_this.get(0).checked) {
                      var allSelect = _root.find(".select").find(
                          "input[type=checkbox]");
                      allSelect.prop("checked", true);
                    } else {
                      var allSelect = _root.find(".select").find(
                          "input[type=checkbox]");
                      allSelect.prop("checked", false);
                    }
                  }
                });

            _root.off("click", "#stateSureBtn").on("click",
                "#stateSureBtn", function () {
                  var allSelect = _root.find(".select").find(
                      "input[type=checkbox]");
                  var allState = "";
                  allSelect.each(function () {
                    var thisCheckBox = $(this);
                    var _state = thisCheckBox.val();
                    if (this.checked && _state != -1) {
                      allState += thisCheckBox.get(0).name + ",";
                    }
                  });
                  if (allState == "") {
                    var tab = _root.find("#selector").attr("tab");
                    if (tab == 1){
                      allState = "请选择书本状态";
                    }else{
                      allState = "玩瞳书本图像状态";
                    }
                  } else {
                    allState = allState.substring(0, allState.length - 1);
                  }
                  _root.find(".mr-selector").text(allState);
                  _root.find(".mr-selector").attr("title", allState);
                  $("#selector .select").hide();
                  _refreshList(1);
                });

            $("body").click(function () {
              $("#selector .select").hide();
            });
            $("#modelId").off("change").on("change", function () {
              _modelId = parseInt($(this).find("option:selected").val());
              _conf.modelId = _modelId;
              _refreshList(1);
            });
          },
          _initWorkOrderSelect = function () {
            $("#workOrderSelect").chosen({
              allow_single_deselect: true,
              search_contains: true,
              width: '100%'
            });
            $("#workOrderSelect").on("change", function () {
              var val = $(this).val();
              if (val != -1){
                _root.find("#batchUpdateStateBtn").css("display","inline");
                _root.find("#batchCreateBookBtn").css("display","inline");
              }else {
                _root.find("#batchUpdateStateBtn").css("display","none");
                _root.find("#batchCreateBookBtn").css("display","none");
              }

              //获得选中的内容
              _clearStateCheck();
              _refreshList();
            });

            $("#sortTypeSelect").chosen({
              allow_single_deselect: true,
              search_contains: true,
              width: '100%'
            });

            $("#sortTypeSelect").on("change", function () {
              //获得选中的内容
              _refreshList();
            });

            $(".chosen-search::before").css("display", "none");
            $("a.chosen-single").css("border-radius", "0px");
            $("a.chosen-single").children("div").children("b").css("display","none");

            $(".chosen-container-single a").css("height","29px");
          },
          _downloadExcel = function () {
            var searchVO = _loadParameters();
            var currentPage = _root.find("#pagination").attr("currentpage");
            if (currentPage == undefined) {
              currentPage = 1;
            }
            window.open(
                _conf.DOWNLOAD_EXCEL_URL + "?searchVO=" + encodeURI(
                JSON.stringify(searchVO)) + "&currentPage=" + currentPage);
          },
          _changeBookState = function (id, oldState, newState) {
            if (oldState == newState) {
              return;
            }
            var remark = "";
            if (newState == 13) {
              layer.prompt({
                formType: 2,
                value: '',
                btn: ['保存', '取消'],
                resize: false,
                title: '请备注原因',
                maxlength: 50,
                area: ['400px', '150px'], //自定义文本域宽高
                end: function () {
                  $("#bookStateSelect").val(oldState);
                },
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
                remark = value;
                $.get(_conf.CHANGE_BOOK_STATE_URL + "?id=" + id + "&state="
                    + newState + "&remark=" + remark, {}, function (data) {
                  if (data.code == 0) {
                    oldState = newState;
                    layer.msg("更新成功");
                    layer.close(_index);
                    _refreshCurrentList();
                  } else {
                    layer.msg("更新失败");
                  }
                });
              });
            } else {
              $.get(_conf.CHANGE_BOOK_STATE_URL + "?id=" + id + "&state="
                  + newState + "&remark=" + remark, {}, function (data) {
                if (data.code == 0) {
                  layer.msg("更新成功");
                  layer.close(_index);
                  _refreshCurrentList();
                } else {
                  layer.msg("更新失败");
                }
              });
            }
          },
          _createBook = function (id) {
            $.get(_conf.CREATE_BOOK_URL + "?id=" + id + "&&modelId="
                + _conf.modelId, {}, function (data) {
              if (data.code == 0) {
                layer.msg("创建成功");
                _refreshCurrentList();
              } else {
                layer.msg("创建失败:" + data.msg);
              }
            });
          },
          _refreshCurrentList = function () {
            var currentPage = _root.find("#pagination").attr("currentpage");
            _refreshList(currentPage);
          },
          _setSameBook = function (bookId, bookName) {
            $.get(
                _conf.SET_SAME_BOOK_URL + "?id=" + _bookProgressId + "&&bookId="
                + bookId + "&&type=" + _checkType,
                {}, function (data) {
                  if (data.code == 0) {
                    layer.close(_index);
                    if (_checkType == 1) {
                      layer.alert('是否添加到《' + bookName + '》的附属ISBN中',
                          function (index) {
                            $.get(
                                _conf.ADD_BOOK_ISBN + "?id=" + _bookProgressId
                                + "&&bookId=" + bookId,
                                {}, function (data) {
                                  if (data.code == 0) {
                                    layer.msg("添加成功");
                                  } else {
                                    layer.msg("添加失败");
                                  }
                                });
                          });
                    } else {
                      layer.msg("更新成功");
                    }
                  } else {
                    layer.msg("更新失败");
                  }
                });
          },
          _setSameTask = function (sameTaskId) {
            $.get(
                _conf.SET_SAME_TASK_URL + "?id=" + _bookProgressId + "&&taskId="
                + sameTaskId,
                {}, function (data) {
                  if (data.code == 0) {
                    layer.close(_index);
                    layer.msg("更新成功");
                  } else {
                    layer.msg("更新失败");
                  }
                });
          },
          _clearStateCheck = function () {
            _root.find(".mr-selector").text("请选择书本状态");
            _root.find(".mr-selector").attr("title", "请选择书本状态");
            var allSelect = _root.find("#selector").find(
                "input[type=checkbox]");
            allSelect.prop("checked", true);
          },
          _initLeadBtn = function () {
            //晚上23点到第二天9点导出表格按钮不可点击
            /*var myDate = new Date();
            var mytime = myDate.toLocaleString('chinese', {hour12: false});
            var leadBtn = _root.find("#leadOutExcelBtn");
            console.log("myTime:" + mytime);
            var time1 = mytime.split(":")[0];
            var hour = time1.substr(time1.length - 2, 2);
            console.log("hour1:" + hour);
            //正式产线约定时间
            if (hour < 9 || hour > 22) {
              leadBtn.remove("disabled");
              leadBtn.css("background", "").css("color", "");
            } else {
              leadBtn.attr("disabled", "disabled");
              leadBtn.css("background", "#f1f1f1").css("color", "#b1b2b3");
            }*/
            //测试时间
            /*if (hour > 16 && hour < 19) {
              leadBtn.remove("disabled");
              leadBtn.css("background", "").css("color", "");
            } else {
              leadBtn.attr("disabled", "disabled");
              leadBtn.css("background", "#f1f1f1").css("color", "#b1b2b3");
            }*/
          },
          _loadCheckTaskInfo = function (taskId) {
            $.ajax({
              url: _conf.LOAD_TASK_INFO_URL,
              type: "GET",
              async: false,
              contentType: "application/json",
              data: {
                taskId: taskId
              },
              dataType: 'json',
              success: function (data) {
                if (data.code == 0) {
                  var taskCheckInfoDIV = _root.find("#taskCheckInfoDIV");
                  taskCheckInfoDIV.find("#bookNumber").html(
                      data.data.innerId == 0 ? "" : data.data.innerId);
                  taskCheckInfoDIV.find("#isbn").html(data.data.isbn);
                  taskCheckInfoDIV.find("#bookName").html(data.data.name);
                  taskCheckInfoDIV.find("#author").html(data.data.author);
                  taskCheckInfoDIV.find(
                      "#publisher").html(data.data.publisher);
                  taskCheckInfoDIV.find(
                      "#seriesTitle").html(data.data.seriesTitle);
                  taskCheckInfoDIV.find(
                      "#stateName").html(data.data.stateName);
                } else {
                  //do error
                }
              }
            });
          };
      return {
        init: function (conf) {
          _init(conf);
        }
      }
    }
)
();
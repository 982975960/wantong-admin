wantong.base.pageAdd.pageList = (function () {
  var
      _root = null,
      _container = null,
      _itemTemplateHtml = "",
      _rowTemplateHtml = "",
      _examine = false,
      _bookState = 0,
      _bookInfoState = 0,
      _origin = 0,
      _pages = null,
      _conf = {
        URL_LIST_PAGE: GlobalVar.contextPath + "/base/listPages.do",
        URL_DELETE_PAGE: "base/deletePage.do?pageId={id}&deleteIndexOnly=false",
        URL_CHANGE_BOOK_STATUS: GlobalVar.contextPath
            + "/base/changeBookStatus.do",
      },
      _init = function (conf) {
        $.extend(_conf, conf);
        _root = _conf.rootNode;
        _examine = _conf.examine;
        _bookState = _conf.bookState;
        _bookInfoState = _conf.bookInfoState;
        _origin = _conf.origin;
        console.log("_origin:"+_origin);
        _itemTemplateHtml = _root.find("#itemTemplate").prop('outerHTML');
        _rowTemplateHtml = "<div class=\"row page-list-row\"></div>";
        _blankItemTemplateHtml = "<div id=\"itemTemplate\" class=\"col-md-2\">&nbsp;</div>";
        _addNewPageInit();
      },
      _addNewPageInit = function () {
        $("#addNewPageBtn").on("click", function () {
          wantong.base.pageAdd.renewAll(_calcNextPhy());
          _renderEditing();
        });
      },
      _initEditButton = function () {
        _root.find(".thumbnail-container").mouseover(function () {
          var pageNode = $(this).parent();
          var status = pageNode.attr("status");
          if (status == "0" || status == "6" || status >= 100) {
            $(this).find("#editBtnContainer").show();
          }
          if($(this).find(".img-thumbnail").attr("class") == "img-thumbnail"){
            $(this).find(".img-thumbnail").addClass("mouseHover");
          }
        }).mouseout(function () {
          $(this).find("#editBtnContainer").hide();

          $(this).find(".img-thumbnail").removeClass("mouseHover");
        });
        _root.find(".edit-btn-container").on("click", function () {
          wantong.base.pageAdd.loadPageData(
              $(this).parents("#pageItem").attr("pageId"));
          wantong.base.pageAdd.linsterUndate();
          wantong.base.pageAdd.setSaveNextButtonState(false);
        });
        _root.find(".deleteBtn").on("click", function (e) {
          e.stopPropagation();

          var _isDelete = true;
          var pageId = $(this).parents("#pageItem").attr("pageId");
          var bookId = $(this).parents("#pageItem").attr("bookId");
          layer.confirm('确定要删除这页吗？', {
            btn: ['确定', '取消'] //按钮
          }, function () {
            if (_isDelete) {
              _isDelete = false;
              var url = _conf.URL_DELETE_PAGE;
              url = url.replace("{id}", pageId);
              $.get(url, {}, function (data) {
                if (data.code == 0) {
                  layer.msg("已删除");
                  _refresh(bookId);
                  var currentEditingId = wantong.base.pageAdd.getEditingPageId();
                  if (pageId == currentEditingId) {
                    //如果删除的页面正好是当前页，则清空编辑页
                    wantong.base.pageAdd.renewAll();
                    wantong.base.pageAdd.linsterUndate();
                  }
                } else {
                  layer.msg(data.msg);
                  _refresh(bookId);
                }
              })
            }

          }, function () {

          });
        });
      },
      _refresh = function (bookId, examineCallback, noExamineCallBack) {
        $.get(_conf.URL_LIST_PAGE + "?bookId=" + bookId,
            {},
            function (data) {
              _renewAll();
              if (data.code == 0) {
                // 每次刷新书页列表的时候会从服务器获得书本信息，可以把书本信息保存在_pages，书本完整检测的时候可以使用，不需要重新从服务器请求数据
                _pages = data.data.pages;
                _render(_pages, bookId);
                _initEditButton();
                //默认打开
                var span = $("#togglePageListPanelBtn").find("span");
                if (span.hasClass("glyphicon-chevron-right")) {
                  $('#togglePageListPanelBtn').click();
                }
                if (examineCallback) {
                  examineCallback();
                } else {
                  var firstPage = _root.find(".page-list-row");
                  if (firstPage.length == 0) {
                    _renderEditing();
                  } else {
                    _root.find(".page-list-row .edit-btn-container:first").click();
                  }
                }
                if (noExamineCallBack) {
                  noExamineCallBack();
                }

              }
            });
      },
      _renewAll = function () {
        _root.children().each(function () {
          if ($(this).attr("id") != "itemTemplate") {
            $(this).remove();
          }
        });
      },
      _clearEditing = function () {
        $('#editingItem').parent().remove();
      },
      _renderEditing = function () {
    console.log("eeeeeeeeee");
        var _nextPhy = _calcNextPhy();
        if (_root.find("#editingItem").length > 0) {
          return;
        }
        $('#pageListContainer .page-thumbnail-container .active').removeClass(
            'active');
        var newNode = $(_itemTemplateHtml);
        newNode.show();
        newNode.attr("id", "editingItem");
        newNode.attr("pageId", 0);
        newNode.attr("bookId", 0);
        newNode.attr("status", 0);
        newNode.attr("examine", 0);
        newNode.find("#thumbnail").find("img").attr("src",
            "/static/images/newPage.jpg");
        newNode.find("#thumbnail").find("img").addClass('active');
        newNode.find("#paginationText").text("");
        $("#phyPage").val(_nextPhy);
        var row = $(_rowTemplateHtml);
        row.append(newNode);
        _root.append(row);
        _root.scrollTop(_root[0].scrollHeight);
      },
      _render = function (pages) {
        var pageType = ["封面", "封里", '扉页', '目录', '正文', '辅文', '封底里', '封底', '其它'];
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
              var id = pages[itemIndex].id;
              var bookId = pages[itemIndex].baseBookId;
              var coverImage = pages[itemIndex].coverImage.imageName;
              var index = pages[itemIndex].pageType;
              var status = pages[itemIndex].trainTaskStatus;
              var examine = pages[itemIndex].examine;
              var modelId = pages[itemIndex].modelId;
              var position = pages[itemIndex].position;
              if (index > 0) {
                index--;
              } else if (index == -1) {
                index = 8;
              }
              //var paginationText = pageType[index] + " - 第"
              //   + pages[itemIndex].pagination + "页";
              var paginationText = pages[itemIndex].physicalIndex;
              if (pages[itemIndex].physicalState != 0) {
                paginationText += (' - ' + pages[itemIndex].physicalState);
              }
              var newNode = $(_itemTemplateHtml);
              newNode.show();
              newNode.attr("id", "pageItem");
              newNode.attr("pageId", id);
              newNode.attr("bookId", bookId);
              newNode.attr("status", status);
              newNode.attr("examine", examine);
              newNode.find("#thumbnail").find("img").attr("src",
                  GlobalVar.services.FDS + GlobalVar.services.THUMBNAILPATH
                  + "/" + bookId
                  + "/" + coverImage);
              newNode.find("#paginationText").text(paginationText);
              var statusNode = newNode.find("#status");
              console.log("examine list-> " + examine);
              if (_examine) {
                console.log("examine:" + _examine);
                statusNode.show();
                newNode.find("#editBtn").removeClass('glyphicon-edit').addClass(
                    'glyphicon-check');
                if (examine == 0) {
                  statusNode.find("span").addClass("label-default").text("未审核");
                } else if (examine == 2) {
                  statusNode.find("span").addClass("label-danger").text("数据有误");
                } else if (examine == 1) {
                  statusNode.find("span").addClass("label-success").text(
                      "审核通过");
                }
              }
              if (_origin != 2){
                //_bookState == 4 说明在全部搜索模块，_bookInfoState是书本状态state的值
                if (_bookState == 1 || ( _bookState == 4 && _bookInfoState == 1 )) {
                  console.log("bookstate:" + _bookState + "===bookInfoState: " + _bookInfoState);
                  statusNode.show();
                  if (position == "") {
                    statusNode.find("span").addClass("label-warning").text(
                        "待标定书本");
                  } else {
                    statusNode.find("span").addClass("label-success").text(
                        "已标定书本");
                  }
                }
              }
              row.append(newNode);
            }
          }
          if (row.length > 0) {
            _root.append(row);
          }
        }
      },
      // 书本信息完整性检测
      _bookInfoCheck = function (bookExamine) {
        var pages1 = []; //封面
        var pages2 = []; //封里
        var pages3 = []; //扉页
        var pages4 = []; //目录
        var pages5 = []; //正文
        var pages6 = []; //辅文
        var pages7 = []; //封底里
        var pages8 = []; //封底
        var pages9 = []; //其它
        var size = _pages.length;
        var pagesRepeat1 = false; //封面页码重复
        var pagesRepeat5 = false; //正文页码重复
        var pagesRepeat8 = false; //封底页码重复
        var pagesReType = "";  //页码重复类型
        for (var i = 0; i < size; ++i) {
          var pageType = _pages[i].pageType;
          if (pageType == -1) {
            pageType = 9;
          }
          switch (pageType) { //暂时只检测两种类型，后续可以添加其它页面类型的检测
            case 1:
              if (pages1.indexOf(_pages[i].pagination) != -1) {
                pagesRepeat1 = true;
              }
              pages1.push(_pages[i].pagination);
              break;
            case 5:
              if (pages5.indexOf(_pages[i].pagination) != -1) {
                pagesRepeat5 = true;
              }
              pages5.push(_pages[i].pagination);
              break;
            case 8:
              if (pages8.indexOf(_pages[i].pagination) != -1) {
                pagesRepeat8 = true;
              }
              pages8.push(_pages[i].pagination);
              break;
            default:
              break;
          }
        }
        if (pagesRepeat1) {
          pagesReType += "封面";
        }
        if (pagesRepeat5) {
          pagesReType += " 正文";
        }
        if (pagesRepeat8) {
          pagesReType += " 封底";
        }

        var lackPageTypes = []; //类型缺失
        var lackPages = false; //页码缺失
        for (var i = 1; i < 10; ++i) {
          switch (i) {
            case 1:
              if (pages1.length == 0) {
                // lackPageTypes.push("封面");
                _hintLackOfCover(bookExamine);
                return;
              }
              break;
            case 5:
              if (pages5.length == 0) {
                lackPageTypes.push("正文");
              } else if (pages5.length < pages5[pages5.length - 1]) {
                lackPages = true;
              }
              break;
            case 8:
              if (pages8.length == 0) {
                lackPageTypes.push("封底");
              }
              break;
            default:
              break;
          }
        }
        var msg = "";
        if (lackPageTypes.length > 0) {
          msg += "缺少";
          for (var i = 0; i < lackPageTypes.length; ++i) {
            msg += lackPageTypes[i];
            if (i < lackPageTypes.length - 1) {
              msg += "、";
            }
          }
          msg += "，";
        }
        if (lackPages) {
          msg += "正文页码有缺失，";
        }
        if (msg == "") {
          if (pagesRepeat1 || pagesRepeat5 || pagesRepeat8) {
            layer.msg("该绘本" + pagesReType + "有重复页码，请修改！");
          } else if (bookExamine) {
            layer.msg("绘本书页完整!");
          } else if ($('#listTab li[index=0]').hasClass('active')) {
            //已发布 完整不提醒
          } else {
            layer.msg("绘本书页完整");
          }
        } else {
          layer.msg("该绘本" + msg + "请添加!");
        }
      },
      _checkExamineBook = function (bookId, callBack) {
        //检查未审核完全书本是否有需要重新训练的书本
        var isAllExamine = true;
        var isNeedTrain = false;
        var size = _pages.length;
        var examineNum = 0;
        var trainNum = 0;
        for (var i = 0; i < size; ++i) {
          if (_pages[i].trainTaskStatus == 0) {
            isNeedTrain = true;
            trainNum++;
          } else if (_pages[i].examine == 0) {
            isAllExamine = false;
          }
          if (_pages[i].examine == 3) {
            examineNum++;
          }
        }
        if ((examineNum + trainNum) == size && isNeedTrain) {
          //全部状态为审核通过和待训练
          layer.close(layer.index);
          $.ajax({
            type: "post",
            url: _conf.URL_CHANGE_BOOK_STATUS + "?status=" + true,
            data: {"bookId": bookId},
            dataType: "json",
            success: function (data) {
              if (callBack != null) {
                callBack();
              }
            },
            error: function (data) {
              if (callBack != null) {
                callBack();
              }
            }
          });
        }
        if (!isAllExamine && isNeedTrain) {
          layer.confirm('书本未审核完成，是否将该书移至‘待训练’中', {
            btn: ['确定', '取消']
          }, function () {
            layer.close(layer.index);
            $.ajax({
              type: "post",
              url: _conf.URL_CHANGE_BOOK_STATUS + "?status=" + true,
              data: {"bookId": bookId},
              dataType: "json",
              success: function (data) {
                if (callBack != null) {
                  callBack();
                }
              },
              error: function (data) {
                if (callBack != null) {
                  callBack();
                }
              }
            });
          }, function () {
            $.ajax({
              type: "post",
              url: _conf.URL_CHANGE_BOOK_STATUS + "?status=" + false,
              data: {"bookId": bookId},
              dataType: "json",
              success: function (data) {
                if (callBack != null) {
                  callBack();
                }
              },
              error: function (data) {
                if (callBack != null) {
                  callBack();
                }
              }
            });
          });
        } else {
          if (callBack != null) {
            callBack();
          }
        }
      },
      _calcNextPhy = function () {
        var maxPhy = 0;
        for (var i = 0; i < _pages.length; i++) {
          var page = _pages[i];
          if (page.physicalIndex) {
            maxPhy = maxPhy > page.physicalIndex ? maxPhy : page.physicalIndex;
          }
        }
        return maxPhy + 1;
      },
      _hintLackOfCover = function (ex) {
        var index = layer.open({
          title: '<div style=" text-align: center;margin-left: 25%">重要提示</div>',
          type: 1,
          maxmin: false,
          shadeClose: true,
          resize: false,
          scrollbar: false,
          content: '<div style="padding: 20px 54px;color: red">缺少封面，请添加，否则该书无法识别！</div>',
          btn: `我知道了`,
          btnAlign: 'c',
          yes: function () {
            if (ex == undefined) {
              layer.close(index);
            } else {
              layer.closeAll();
            }
          }
        });

      };

  return {
    init: function (conf) {
      _init(conf);
    },
    refresh: function (bookId, cb, call) {
      _refresh(bookId, cb, call);
    },
    bookInfoCheck: function (bookExamine) {
      _bookInfoCheck(bookExamine);
    },
    checkExamineBook: function (bookId, callback) {
      _checkExamineBook(bookId, callback);
    },
    clearEditing: function () {
      _clearEditing();
    },
    renderEditing: function () {
      _renderEditing();
    },
    calcNextPhy: function () {
      _calcNextPhy();
    }
  }
})();

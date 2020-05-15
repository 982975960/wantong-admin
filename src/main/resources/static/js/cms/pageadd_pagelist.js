wantong.cms.pageAdd.pageList = (function () {
  var
      _root = null,
      _container = null,
      _itemTemplateHtml = "",
      _rowTemplateHtml = "",
      _examine = false,
      _pages = null,
      _initializationLayer = true,
      _conf = {
        URL_LIST_PAGE: GlobalVar.contextPath + "/cms/listPages.do",
        URL_DELETE_PAGE: "cms/deletePage.do?pageId={id}&deleteIndexOnly=false",
        URL_CHANGE_BOOK_STATUS: GlobalVar.contextPath
            + "/cms/changeBookStatus.do"
      },
      _init = function (conf) {
        $.extend(_conf, conf);
        _root = _conf.rootNode;
        _examine = _conf.examine;
        _itemTemplateHtml = _root.find("#itemTemplate").prop('outerHTML');
        _rowTemplateHtml = "<div class=\"row page-list-row\"></div>";
        _blankItemTemplateHtml = "<div id=\"itemTemplate\" class=\"col-md-2\">&nbsp;</div>";
        _addNewPageInit();
      },
      _addNewPageInit = function () {
        $("#addNewPageBtn").on("click", function () {
          wantong.cms.pageAdd.renewAll();
          _renderEditing();
        });
      },
      _initEditButton = function () {
        //鼠标移入元素图片元素上
        _root.find(".thumbnail-container").mouseover(function () {
          var pageNode = $(this).parent();
          var status = pageNode.attr("status");
          $(this).find("#editBtnContainer").show();
          if ($(this).find(".img-thumbnail").attr("class") == "img-thumbnail") {
            $(this).find(".img-thumbnail").addClass("mouseHover");
          }

        }).mouseout(function () {

          $(this).find("#editBtnContainer").hide();
          //
          $(this).find(".img-thumbnail").removeClass("mouseHover");
        });
        _root.find(".edit-btn-container").on("click", function () {
          if (wantong.cms.pageAdd.flag && $('#saveAndNextButton').attr('disabled') != 'disabled') {
            layer.confirm('当前书页有资源尚未保存', {
              title:'提示',
              btn: ['确认保存', '取消保存'] //按钮
            }, (index) => {
              $('#saveAndNextButton').click();
            }, () => {
              wantong.cms.pageAdd.loadPageData(
                  $(this).parents("#pageItem").attr("pageId"));
            });
          } else {
            wantong.cms.pageAdd.loadPageData(
                $(this).parents("#pageItem").attr("pageId"));
          }
        });

        _root.find(".view-btn").on("click", function (e) {

          //停止查看图片按钮的点击事件冒泡

          e.stopPropagation();
          $(this).blur();

          var src = $(this).parents("#thumbnailContainer").attr(
              "img");
          var thumb = $(this).parents("#thumbnailContainer").find("img").attr(
              "src");
          var content = '<div id="show-imgae-content" class="show-image">' +
              '<img style="user-select: none" src="' + src + '">' +
              '</div>';
          // _initializationLayer = false;
          // var index = layer.open({
          //   type: 1,
          //   title: false,
          //   shade: 0.9,
          //   closeBtn: 0,
          //   area: '1280px 700px',
          //   skin: 'layui-layer-nobg', //没有背景色
          //   shadeClose: true,
          //   content: content,
          //   scrollbar: false,
          //   resize: false,
          //   success: function (layero) {
          //     var mask = $(".layui-layer-shade");
          //     mask.appendTo(layero.parent());
          //     //其中：layero是弹层的DOM对象
          //   },
          //   end: function () {
          //     _initializationLayer = true;
          //   }
          // });
          console.log('show src', src);
          layer.photos({
            photos: {
              "title": "", //相册标题
              "id": "", //相册id
              "start": 0, //初始显示的图片序号，默认0
              "data": [   //相册包含的图片，数组格式
                {
                  "alt": "",
                  "pid": "", //图片id
                  "src": src, //原图地址
                  "thumb": thumb //缩略图地址
                }
              ]
            }
          });
        });
      },
      _refresh = function (bookId, examineCallback, noExamineCallBack) {
        $.get(_conf.URL_LIST_PAGE + "?bookId=" + bookId + "&&repoId="
            + _conf.repoId,
            {},
            function (data) {
              _renewAll();
              if (data.code == 0) {
                // 每次刷新书页列表的时候会从服务器获得书本信息，可以把书本信息保存在_pages，书本完整检测的时候可以使用，不需要重新从服务器请求数据
                _pages = data.data.pages;
                _render(_pages, bookId);
                _initEditButton();
                wantong.cms.pageAdd.batchUploadAudio.init(data.data.pages);
                //默认打开
                var span = $("#togglePageListPanelBtn").find("span");
                if (span.hasClass("glyphicon-chevron-right")) {
                  $('#togglePageListPanelBtn').click();
                }
                if (examineCallback) {
                  examineCallback();
                } else {
                  //点读才有判断保存跳转
                  if (wantong.cms.pageAdd.flag) {
                    $('#saveAndNextButton').attr('disabled', 'disabled');
                  }

                  var firstPage = _root.find(".page-list-row .edit-btn:first");
                  if (firstPage.length == 0) {
                    _renderEditing();
                  } else {
                    _root.find(".page-list-row .edit-btn:first").click();
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
            "/static/images/gray.jpg");
        newNode.find("#thumbnail").find("img").addClass('active');
        newNode.find("#paginationText").text("");
        var row = $(_rowTemplateHtml);
        row.append(newNode);
        _root.append(newNode);
        _root.scrollTop(_root[0].scrollHeight);
      },
      _render = function (pages) {
        var pageType = ["封面", "封里", '扉页', '目录', '正文', '辅文', '封底里', '封底', '其它'];
        var size = pages.length;
        var rows = size / 1;
        if (size % 1 > 0) {
          rows++;
        }
        for (var i = 0; i < rows; i++) {
          var row = $(_rowTemplateHtml);
          for (var j = 0; j < 1; j++) {
            var itemIndex = i * 1 + j;
            if (itemIndex < size) {
              var id = pages[itemIndex].id;
              var baseBookId = pages[itemIndex].baseBookId;
              var bookId = pages[itemIndex].bookId;
              var coverImage = pages[itemIndex].coverImage.coverImageName;
              var image = pages[itemIndex].coverImage.imageName;
              var index = pages[itemIndex].pageType;
              var modelId = pages[itemIndex].modelId;
              // var status = pages[itemIndex].trainTaskStatus;
              var examine = pages[itemIndex].examine;
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
              // newNode.attr("status", status);
              newNode.attr("examine", examine);
              newNode.find("#thumbnailContainer").attr("img", GlobalVar.services.FDS + GlobalVar.services.BOOKIMAGEPATH
                  + "/" + modelId
                  + "/" + baseBookId
                  + "/" + coverImage);
              newNode.find("#thumbnail").find("img").attr("src",
                  GlobalVar.services.FDS + GlobalVar.services.THUMBNAILPATH
                  + "/" + baseBookId + "/" + image);
              newNode.find("#paginationText").text(paginationText);
              var statusNode = newNode.find("#status");
              console.log("examine list-> " + examine + "...." + status);
              if (status != 0 && status != 3) {
                statusNode.show();
                newNode.find("#editBtn").removeClass('glyphicon-edit').addClass(
                    'glyphicon-check');
                if (examine == 0) {
                  statusNode.find("span").addClass("label-default").text("未审核");
                } else if (examine == 2) {
                  statusNode.find("span").addClass("label-danger").text("数据有误");
                } else if (examine == 3) {
                  statusNode.find("span").addClass("label-success").text(
                      "审核通过");
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
        //sp17去掉提示
        return;

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
          pagesReType += pagesRepeat1 ? " 正文" : "正文";
        }
        if (pagesRepeat8) {
          pagesReType += pagesRepeat1 || pagesRepeat5 ? " 封底" : "封底";
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
        var size = _pages.length;
        var examineNum = 0;
        for (var i = 0; i < size; ++i) {
          if (_pages[i].examine == 0) {
            isAllExamine = false;
          }
          if (_pages[i].examine == 3) {
            examineNum++;
          }
        }
        if (examineNum == size) {
          //全部状态为审核通过和待训练
          layer.close(layer.index);
          $.ajax({
            type: "post",
            url: _conf.URL_CHANGE_BOOK_STATUS + "?status=" + true,
            data: {"bookId": bookId},
            dataType: "json",
            success: function (data) {
              layer.closeAll();
              setTimeout(function () {
                layer.msg("书本资源全部审核通过，已移至已审核环节");
                if (callBack != null) {
                  callBack();
                }
              },1*1000);
            },
            error: function (data) {
              if (callBack != null) {
                callBack();
              }
            }
          });
        } else {
          wantong.cms.bookAdd.showExBookMessageHintFrame();
        }
        if (!isAllExamine) {
          if (callBack != null) {
            callBack();
          }
        } else {
          if (callBack != null) {
            callBack();
          }
        }
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
    }
  }
})();
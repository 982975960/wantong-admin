wantong.cardGroupManager = (function () {
  var
      _root = null,
      _conf = null,
      CARD_MANAGER_URL = GlobalVar.contextPath + "/card/cardGroupManager.do",
      ADD_CARD_GROUP_URL = "/card/addCardGroup.do",
      DELETE_CARD_GROUP_URL = "/card/deleteCardGroup.do",
      _init = function (conf) {
        $.extend(_conf, conf);
        _root = $("#cardGroupManager");
        if (_root.find("#pagination").length > 0) {
          _initPagination(_root.find("#pagination"));
        }

        _initButton();
      },
      _initButton = function () {
        _root.find(".editBtn-container").click(function () {
          $(this).blur();
          var groupId = $(this).attr("cardgroupid");
          console.log("groupId:" + groupId);
          _openGroup(groupId);
        });
        _root.find(".dlClass").mouseenter(function () {
          $(this).find(".pro-window").css("visibility", "visible");
          $(this).find(".editBtn-container").css("visibility", "visible");
        });

        _root.find(".dlClass").mouseleave(function () {
          $(this).find(".pro-window").css("visibility", "hidden");
          $(this).find(".editBtn-container").css("visibility", "hidden");
          $(this).parent().find(".pro-window-box").css("display", "none");
        });
        _root.find(".pro-window-ico").click(function () {
          $(this).parent().find(".pro-window-box").css("display", "inline");
        });
        _root.find(".delete-btn").click(function () {
          $(this).blur();
          var groupId = $(this).attr("cardGroupId");
          console.log("groupId:" + groupId);
          _deleteGroup(groupId);
        });

        _root.find("#createCardGroupBtn").click(function () {
          $(this).blur();
          _openGroup();
        });

        _root.find("#searchBtn").click(function () {
          $(this).blur();
          //点击搜索
          _searchGroup();
        });

        _root.find("#clearBtn").click(function () {
          $(this).blur();
          //点击搜索
          _clearSearch();
        });

        _root.find("#searchDiv").off("keydown").on("keydown",function (event) {
          if (event.keyCode == 13) {
            _searchGroup();
          }
        });

      },
      _deleteGroup = function (groupId) {
        layer.confirm('确定要删除该套装吗？', {btn: ['确认', '取消']}, function () {
          $.ajax({
            type: "post",
            url: DELETE_CARD_GROUP_URL,
            data: {
              groupId: groupId
            },
            dataType: "json",
            success: function (data) {
              if (data.code == 0) {
                layer.msg("删除套装成功");
              } else {
                layer.msg("删除失败");
              }
            }
          }).fail(function () {
            layer.msg("服务无响应");
          }).always(function () {
            _refreshCurrentPage();
          });
        });
      },
      _clearSearch = function () {
        _root.find("#groupNameInput").val("");
        _root.find("#groupIDInput").val("");
      },
      _searchGroup = function () {
        var groupName = _root.find("#groupNameInput").val();
        var groupId = _root.find("#groupIDInput").val();
        $.get(CARD_MANAGER_URL, {
          groupName: groupName,
          groupId: groupId,
          currentPage: 1,
          isSearch: 1
        }, function (data) {
          var obj = $(data);

          $("#cardGroupManager").html(data);
        });
      },
      _openGroup = function (groupId) {
        if (groupId == undefined) {
          groupId = 0;
        }

        groupId = parseInt(groupId);
        var modelId = _root.find("#cardModel").attr("modelId");
        var title = groupId == 0 ? "添加卡片套装" : "编辑卡片套装";
        $.post(ADD_CARD_GROUP_URL, {
          modelId: modelId,
          groupId: groupId
        }, function (html) {
          layer.open({
            title: title,
            type: 1,
            maxmin: false,
            resize: false,
            area: ['700px', '550px'],
            content: html,
            end: function () {
              _refreshCurrentPage();
            },
            cancel: function () {

            },
            success: function () {

            }
          });
        });
      },
      _refreshList = function (page) {
        if (page == undefined) {
          page = 1;
        }
        var groupName = _root.find("#groupName").val();
        var groupId = _root.find("#groupId").val();
        wantong.frame.showPage(GlobalVar.backPath,
            {
              groupName: groupName,
              groupId: groupId,
              currentPage: page
            });
      },
      _refreshCurrentPage = function () {
        var page = _root.find("#pagination").attr("currentPage");
        _refreshList(page);
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
            layer.msg("请输入正确页数");
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
      }
  ;
  return {
    init: function (conf) {
      _init(conf);
    }
  }
})();
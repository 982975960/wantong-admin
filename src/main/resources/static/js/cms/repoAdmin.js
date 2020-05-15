wantong.repoAdmin = (function () {
  _conf = {
    OPEN_SET_ADMIN_URL: "cms/setRepoAdmin.do",
    HANDLE_ADMIN_URL: "cms/handleRepoAdmin.do"
  },
      _init = function (conf) {
        $.extend(_conf, conf);
        _initPagination($("#setRepoAdminDiv").find("#pagination"));
        _initBtn();
      },
      _initBtn = function () {
        $(".handle-btn").click(function () {
          //当前为可操作，将账户设置为不可操作
          var repoId = $("#setRepoAdminDiv").attr("repoId");
          var adminId = $(this).attr("adminId");
          $.post(_conf.HANDLE_ADMIN_URL, {
            repoId: repoId,
            adminId: adminId,
            type: 1
          }, function (data) {
            if (data.code == 0) {
              layer.msg("设置成功");
              _refreshCurrentList();
            } else {
              layer.msg(data.msg);
            }
          });

        });

        $(".no-handle-btn").click(function () {
          //当前为不可操作，将账户设置为可操作
          var repoId = $("#setRepoAdminDiv").attr("repoId");
          var adminId = $(this).attr("adminId");
          $.post(_conf.HANDLE_ADMIN_URL, {
            repoId: repoId,
            adminId: adminId,
            type: 0
          }, function (data) {
            if (data.code == 0) {
              layer.msg("设置成功");
              _refreshCurrentList();
            } else {
              layer.msg(data.msg);
            }
          });
        });
      },
      _refreshList = function (page) {
        if (page == undefined) {
          page = 1;
        }
        var repoId = $("#setRepoAdminDiv").attr("repoId");
        $.get(_conf.OPEN_SET_ADMIN_URL, {
          currentPage: page,
          id: repoId
        }, function (data) {
          $("#setRepoAdminDiv").html(data);
        });
      },
      _refreshCurrentList = function () {
        var page = $("#setRepoAdminDiv").find("#pagination").attr("currentPage");
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
        paginationDom.find("#jumpButton").off("click").on("click", function () {
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
      };
  return {
    init: function (conf) {
      _init(conf);
    }
  }
})();
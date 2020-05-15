wantong.feedUserListPanel = (function () {

  var
      SEARCH_FEEDBACK_URL = GlobalVar.contextPath + "/feedback/listfeedback.do",
      SET_FEEDBACK_STATE_URL = GlobalVar.contextPath
          + "/feedBack/setfeedbackstate.do",
      _root = null,
      _serachForm = null,
      _conf = {},
      _state = 0,
      _searchText = "",
      _initializationLayer = true,
      _init = function (conf) {
        $.extend(_conf, conf);
        _root = $("#feedBackDetailPanel");
        _serachForm = _root.find("#searchFrom");
        _serachForm.attr("action", SEARCH_FEEDBACK_URL);
        _clickhref();
        _searchUserFeedBack();
        _initPagination(_root.find("#pagination"));
        _intiSelectChange();
        _initSearchMessageBtn();
        _initSetStateBtn();
      },
      _initSetStateBtn = function () {
        $("#feedBackListPanel").find(".btn-info").each(function () {

          $(this).on("click", function () {
            $(this).blur();
            var id = $(this).attr("tid");
            $.get(SET_FEEDBACK_STATE_URL, {
              feedBackId: id
            }, function (data) {
              if (data.code == 0) {
                layer.msg("处理成功");
                _refreshList(_root.find("#pagination").attr("currentPage"));
              } else {
                layer.msg(data.msg);
              }
            });
          });
        });
      },
      _searchRes = function () {
        $('#searchBtn').blur();
        $("#searchText").val($("#searchInput").val());
        // $("#stateValue").val($("#feedbackType").find(
        //     "option:selected").val());
        _searchText = $("#searchText").val();
        if (_searchText == "") {
          layer.msg("请输入要查询的机型");
          return;
        }
        _refreshList();
      },
      _moveToEnd = function (el) {
        if (typeof el.selectionStart == "number") {
          el.selectionStart = el.selectionEnd = el.value.length;
        } else if (typeof el.createTextRange != "undefined") {
          el.focus();
          var range = el.createTextRange();
          range.collapse(false);
          range.select();
        }
      },
      _initSearchMessageBtn = function () {
        console.log("feedback init search");
        $('#searchInput').focus();
        _moveToEnd($('#searchInput')[0]);
        $('#feedBackDetailPanel').parent()[0].onkeydown = function (event) {
          var e = event || window.event;
          if (e && e.keyCode == 13) { //回车键的键值为13
            _searchRes();
          }
        };

        $("#searchBtn").on("click", function () {
          var e = jQuery.Event("keydown");//模拟一个键盘事件
          e.keyCode = 13;//keyCode=13是回车
          $("#searchBtn").trigger(e);//模拟页码框按下回车
        });
      },
      _intiSelectChange = function () {
        $("#feedbackType").change(function () {
          $("#stateValue").val($("#feedbackType").find(
              "option:selected").val());
          _initSearchInput();
          _refreshList();
        });
        //选择列表时更新列表
      },
      _initSearchInput = function () {
        $("#searchInput").val("");
        $("#searchText").val("");
      },
      _initPagination = function (paginationDom) {
        if (_conf.len == 0) {
          layer.msg("暂无数据哦~", {time: 3 * 1000}, function () {
          })
        }
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
          $(this).blur();
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
      _clickhref = function () {
        var href = _root.find("tbody").find("td").find("a");

        href.on("click", function () {
          $(this).blur();
          if (!_initializationLayer) {
            return;
          }
          _initializationLayer = false;
          var thisBtn = $(this);
          var parent = thisBtn.parent("#userbackContent");
          var connet = parent.find("#userFeedBackImage");
          layer.open({
            type: 1,
            title: false,
            closeBtn: 0,
            area: '1280px 700px',
            skin: 'layui-layer-nobg', //没有背景色
            shadeClose: true,
            scrollbar: false,
            resize: false,
            content: connet,
            success: function (layero) {

              var mask = $(".layui-layer-shade");
              mask.appendTo(layero.parent());
              //其中：layero是弹层的DOM对象
            },
            end: function () {
              _initializationLayer = true;
            }
          });
        });

      },
      _refreshList = function (page) {
        _searchText = $("#searchText").val();
        if (_searchText.length >= 30) {
          $("#searchInput").val("");
          layer.msg("不能大于30字符");
          return;
        }
        _state = $("#stateValue").val();
        if (page == undefined) {
          page = 1;
        }
        $.get(SEARCH_FEEDBACK_URL, {
          currentPage: page,
          state: _state,
          deviceType: _searchText
        }, function (data) {
          var a = $("#pagination");
          $("#moduleBodyDiv").html(data);
          $("#feedbackType").find("option[value='" + _state + "']").attr(
              "selected", true);

          $("#stateValue").val(_state);

          $("#searchInput").val(_searchText);
        });

      },
      _searchUserFeedBack = function () {
        var _pageline = _root.find("#pageline");
        var _lis = _pageline.find("li");
        var search = $("#searchInput").val();
        $("#searchText").val(search);
        console.log("search:" + search);
        _lis.on("click", function () {
          $(this).blur();
          var currentPage = $(this).find("a").attr("page");
          if (currentPage == 0) {
            return;
          }

          _serachForm.find("#currentPage").val($(this).find("a").attr("page"));
          var option = {
            dataType: "text",
            success: function (data) {
              $("#moduleBodyDiv").html(data);
            },
            error: function (data) {
              layer.alert("error");
            }
          }
          _serachForm.ajaxSubmit(option);
        });
      };
  return {
    init: function (conf) {
      console.log("init")
      _init(conf);
    }
  };
})();
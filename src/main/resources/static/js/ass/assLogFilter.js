wantong.assLogFilter = (function () {
  var
      CHANGE_STATE_URL = GlobalVar.contextPath + "/ass/changeFilterState.do",
      _init = function () {
        _initComponent();
      },
      _initComponent = function () {
        //初始化toggle bar
        $('.lc-switch').lc_switch();
        //条件筛选
        _initSelector();
        //初始化时间监听
        _initListener();
      },
      _initListener = function () {
        $('.save-log').on('lcs-statuschange', function () {
          var active = ($(this).is(':checked')) ? 1 : 0;
          var origin = $(this).attr('value');
          if (active != origin) {
            console.log('update ', origin, active);
            $(this).attr('value', active);
            _updateState($(this));
          }
        });
      },
      _updateState = function ($dom) {
        var obj = {
          appId: $dom.attr('appid'),
          state: $dom.attr('value')
        };

        $.ajax({
          url: CHANGE_STATE_URL,
          type: 'POST',
          data: obj,
          success: function (data) {
            if (data.code != 0) {
              //恢复原状态.
              // $dom.prop('checked', !(obj.state == 1));
              layer.msg('操作失败!' + data.msg);
            }
          }
        });
      },
      _initSelector = function () {
        var parnerSelector = $('#partnerSelector');
        parnerSelector.chosen({
          allow_single_deselect: true,
          search_contains: true,
          width: '100%'
        }).change(function () {
          console.log('partner change', $(this).val());
          wantong.assFrame.loadFilter();
        });

        parnerSelector.val(parnerSelector.attr('partnerid'));
        parnerSelector.trigger("chosen:updated");

        var appSelector = $('#appSelector');
        appSelector.chosen({
          allow_single_deselect: true,
          search_contains: true,
          width: '100%'
        }).change(function () {
          console.log('app change', $(this).val());
          wantong.assFrame.loadFilter();
        });

        appSelector.val(appSelector.attr('appid'));
        appSelector.trigger("chosen:updated");


        $('.chosen-container').keydown(function (event) {
          if (event.keyCode == 13) {
            console.log('enter');
            event.stopPropagation();
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
            // _refreshList(jumpPage2, 0);
            wantong.assFrame.loadFilter(jumpPage2);
          } else {
            layer.msg("请输入正确页数1")
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
              // _refreshList(prevPage, 0);
              wantong.assFrame.loadFilter(prevPage);
            }
          } else if (page == "0") {
            var nextPage = currentPage + 1;
            if (nextPage <= totalPages) {
              // _refreshList(nextPage, 0);
              wantong.assFrame.loadFilter(nextPage);
            }
          } else {
            if (page != undefined) {
              // _refreshList(page, 0);
              wantong.assFrame.loadFilter(page);
            }
          }
        });
      }
  ;

  return {
    init: function () {
      _init();
    },
    initPagination: function (paginationDom) {
      _initPagination(paginationDom);
    }
  };
})();
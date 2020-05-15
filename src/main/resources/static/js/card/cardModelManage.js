wantong.modelManage = (function () {
  var
      _conf = {
        MODEL_LIST_URL: "card/listModel.do",
        CREATE_EDIT_URL: "card/createAndEdit.do"
      },
      _root = null,
      _init = function (conf) {
        $.extend(_conf, conf);
        _root = $(".content-wrap-w");
        _initBtnEvent();
        _refreshList();
        _initSearchSelect();
      },
      _initSearchSelect = function () {
        $('.form-control-chosen').chosen({
          allow_single_deselect: true,
          width: '100%',
          search_contains: true
        });
      };
  _openCreateAndEditDom = function (partnerId,partnerName,modelId,modelName,flag){
    $.get(_conf.CREATE_EDIT_URL,{
      "partnerId": partnerId,
      "partnerName": partnerName,
      "modelId": modelId,
      "modelName": modelName
    },function (data) {
      var title = flag ? "创建卡片库" : "编辑卡片库";
      layer.open({
        title: title,
        type: 1,
        maxmin: false,
        area: ['500px', '270px'],
        content: data,
        end: function () {
          layer.closeAll();
        },
        cancel: function () {
          _refreshList($("#pagination").attr("currentPage"));
        },
        error: function () {
          layer.msg("创建卡片库失败");
        },
        success: function (layero) {
          var mask = $(".layui-layer-shade");
          mask.appendTo(layero.parent());
          //其中：layero是弹层的DOM对象
        }
      });
    });
  },
      _initBtnEvent = function () {
        $("#searchBtn").on("click", function () {
          $(this).blur();
          _refreshList();
        });
        _root.find(".con-r-top-l").on("keydown",function (event) {
          if (event.keyCode == 13) {
            _refreshList();
          }
        });
        _root.find("#createCardModel").click(function () {
          _openCreateAndEditDom(0,"",0,"",true);
        });
        _root.on("click","button[name='edit']",function () {
          var modelId = $(this).attr("id");
          var partnerId = $(this).attr("partnerId");
          var partnerName = $(this).attr("partnerName");
          var modelName = $(this).attr("modelName");

          _openCreateAndEditDom(partnerId,partnerName,modelId,modelName,false);
        });
      },
      _refreshList = function (page) {
        var partnerId = $("#partnerSelect option:selected").val();
        var modelName = _root.find("#modelName").val();
        if (page == undefined) {
          page = 1;
        }
        if (partnerId == ''){
          partnerId = 0;
        }

        $.get(_conf.MODEL_LIST_URL, {
          partnerId: partnerId,
          modelName: modelName,
          currentPage: page
        }, function (data) {
          var dom = $(data);
          var pagination = dom.find("#pagination");
          if (pagination.length > 0) {
            _initPagination(pagination);
          }
          $("#cardModelList").html(dom);
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
      };
  _refreshCurrentPage = function () {
    var page = $('#pagination').attr('currentpage');
    _refreshList(page);
  };

  return {
    init: function (conf) {
      _init(conf);
    },
    refreshCurrentPage: function () {
      _refreshCurrentPage();
    }
  }
})();

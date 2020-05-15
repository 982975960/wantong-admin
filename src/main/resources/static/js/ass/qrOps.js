wantong.qrOps = (function () {
  var
      SEARCH_LOG_URL = GlobalVar.contextPath + "/ass/qrCancelLog.do",
      SEARCH_QR_URL = GlobalVar.contextPath + "/ass/qrCancel.do",
      DELETE_ACTIVE_URL = GlobalVar.contextPath + "/ass/qrDeleteActive.do",
      DELETE_QR_URL = GlobalVar.contextPath + "/ass/qrDelete.do",
      SEARCH_QR_RECORD_URL = GlobalVar.contextPath + "/ass/opRecord.do",
      _module = 0,
      _root = null,
      _cancelTab = null,
      _cancelLogTab = null,
      page = null,
      currntMonth = null,
      _init = function () {
        _initDom();
        _initTab();
        _root.find("#listTab").find('li').first().click();
      },
      _initDom = function () {
        _root = $("#qrOps");
        _cancelTab = _root.find('#cancel');
        _cancelLogTab = _root.find('#cancelRecord');
      },
      _initTab = function () {
        _root.find("#listTab").find("li").click(function () {
          $(this).siblings("li").removeClass("active");
          $(this).addClass("active");
          var index = parseInt($(this).attr("index"));
          _module = index;
          console.log('init');
          if (index == 0) {
            _cancelTab.css('display', 'block');
            _cancelLogTab.css('display', 'none');

            $('#searchQrInput').val('');
            _loadQr();
          } else if (index == 1) {
            _cancelTab.css('display', 'none');
            _cancelLogTab.css('display', 'block');

            $('#partnerSelector').val('');
            $('#startTime').attr('month', '');
            currntMonth = undefined;
            _loadLog();
          }

          //设置导航栏标题
          $('#curContentTab').html($('#listTab .active a').html());
        });
      },
      _initComponent = function () {
        _root.find('#searchQr').on('click', function () {
          var qrCode = _root.find('#searchQrInput').val();
          if (qrCode == '') {
            layer.msg('请输入激活码开始查询');
            return;
          }
          _loadQr(true)
        });
        _root.find('#clearQr').on('click', function () {
          _root.find('#searchQrInput').val('');
        });

        _root.find("#deleteQr").on('click', function () {
          var qr = _root.find('#resultQr').text();
          var index = layer.confirm('确定要注销此激活码吗?',
              {btn: ['确定', '取消'], title: '提示'}, function () {
                console.log('deleteQr', qr);
                $.ajax({
                  url: DELETE_QR_URL + '?qr=' + qr,
                  type: 'GET',
                  // async: false,
                  // data:JSON.stringify(searchVO),
                  // contentType: "application/json; charset=utf-8",
                  success: function (data) {
                    if (data.code == 0) {
                      $('#searchQrInput').val('');
                    } else {
                      layer.msg("删除失败！");
                    }
                    layer.close(index);
                    _loadQr();
                  }
                });
              }, function () {
                layer.close(index);
              });
        });

        _root.find('.del-qr-active-btn').on('click', function () {
          var activeId = $(this).attr('activeid');
          var index = layer.confirm('确定要删除此条激活信息吗?',
              {btn: ['确定', '取消'], title: '提示'}, function () {
                console.log('delete', activeId);
                $.ajax({
                  url: DELETE_ACTIVE_URL + '?id=' + activeId,
                  type: 'GET',
                  // async: false,
                  // data:JSON.stringify(searchVO),
                  // contentType: "application/json; charset=utf-8",
                  success: function (data) {
                    if (data.code == 0) {
                      //$('#searchQrInput').val('');
                    } else {
                      layer.msg("删除失败！");
                    }
                    layer.close(index);
                    _loadQr();
                  }
                });
              }, function () {
                layer.close(index);
              });
        });
      },
      _initLogComponent = function () {
        var month = $('#startTime').attr('month');
        //日期选择组件
        layui.use(['laydate', 'form'], function () {
          var laydate = layui.laydate,
              layer = layui.layer;
          laydate.render({
            elem: '#startTime' //日期input id
            ,value: month
            , done: function (value, date) {
              //监听日期被切换
              // console.log(value, date , 'done');
              currntMonth = value;
              _loadLog(1);
            }
            , type: 'month'
            , theme: '#3dbeed'
          });
        });
        var selector = $('#partnerSelector');
        selector.chosen({
          allow_single_deselect: true,
          search_contains: true,
          width: '100%'
        }).change(function() {
          console.log('change', $(this).val());
          _loadLog(1);
        });

        selector.val(selector.attr('partnerid'));
        selector.trigger("chosen:updated");
        _initPagination($('#pagination'));
      },
      _loadQr = function (sear) {
        var qrCode = $('#searchQrInput').val();
        $.ajax({
          url: SEARCH_QR_URL + '?qr=' + qrCode,
          type: 'GET',
          async: false,
          // data:JSON.stringify(searchVO),
          // contentType: "application/json; charset=utf-8",
          success: function (data) {
            var dom = $(data);
            _cancelTab.html(dom);
            _root.find('#searchQrInput').val(qrCode);
            var code = _root.find('#resultQr').text();
            if (sear && code.trim() == '') {
              var index = layer.confirm(
                  '此激活码无效，请重新输入!',
                  {
                    title: '提示',
                    btn: ['确定'] //按钮
                  }, function () {
                    layer.close(index);
                  });
            }
            _initComponent();
          }
        });
      },
      _loadLog = function (page) {
        var param = '';
        if (!page) {
          page = 1;
        }

        var partnerId = $('#partnerSelector').val();
        if (!partnerId) {
          partnerId = 0;
        }

        param = '?page='+ page + "&partnerId=" + partnerId ;

        // var month = $('#startTime').val();
        console.log('month', currntMonth);
        if (currntMonth) {
          param += '&month=' + currntMonth;
        }

        $.ajax({
          url: SEARCH_LOG_URL + param,
          type: 'GET',
          async: false,
          // data:JSON.stringify(searchVO),
          // contentType: "application/json; charset=utf-8",
          success: function (data) {
            var dom = $(data);
            _cancelLogTab.html(dom);
            _initLogComponent();
          }
        });
      },
      _loadParameters = function () {
        return {};
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
            _loadLog(jumpPage2);
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
              _loadLog(prevPage);
            }
          } else if (page == "0") {
            var nextPage = currentPage + 1;
            if (nextPage <= totalPages) {
              _loadLog(nextPage);
            }
          } else {
            if (page != undefined) {
              _loadLog(page);
            }
          }
        });
      }

  ;

  return {
    init: function () {
      _init();
    }
  };
})();
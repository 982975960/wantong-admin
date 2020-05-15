wantong.qrcodeConsumptionDetails = (function () {
      var LEAD_OUT_EXCEL_URL = GlobalVar.contextPath
          + "/app/leadoutQrcodeDetailsExcel.do",
          QRCODE_DETAILS_LIST_URL = "/app/qrcodeDetailsList.do",
          PREPARE_EXCEL_URL = "/app/prepareExcel.do",
          CHECK_EXCEL_URL = "/app/checkExcel.do",
          SWITCH_PARTNER_URL = GlobalVar.contextPath + "/app/listpartners.do",
          _index = 0,
          _conf = {},
          _root=null,
          _filePath = "",
          amount = 0,
          _init = function (conf) {
            $.extend(_conf, conf);
            _root = $("#qrcodeConsumptionDetailsManager");
            _initButton();
            _refreshList();
          },
          _initButton = function () {
            _root.find("#leadoutExcel").click(function () {
              _downloadExcel();
            });
            _root.find("#cardNum").change(function () {
              _refreshList();
            });
            if(_conf.authType == 1) {
              $('#cardNum').chosen({
                disable_search: true,
                width: '400px'
              });
            }
            $("#back").off("click").on("click",function () {
              wantong.frame.showPage(SWITCH_PARTNER_URL, {
                partnerId: _conf.partnerId,
                currentPage:_conf.parentPanelPage,
                searchText:_conf.parentSearchText
              });
            });
          },
          _refreshList = function (page) {
            var appId = _conf.appId;
            var recordId = _root.find("#cardNum").val();
            if (page == undefined) {
              page = 1;
            }
            $.get(QRCODE_DETAILS_LIST_URL, {
              appId : parseInt(appId),
              recordId: parseInt(recordId),
              currentPage: page,
              partnerId: _conf.partnerId,
              authType:_conf.authType
            }, function (data) {
              var dom = $(data);
              amount = parseInt(dom.find('#payAmount').attr("amount"));
              var pagination = dom.find("#pagination");
              if (pagination.length > 0) {
                _initPagination(pagination);
              }
              $("#recodeDetailsList").html(dom);
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
          _downloadExcel = function () {
            var appId = _conf.appId;
            var recordId = _root.find("#cardNum").val();
            var fileName = "";
            var cardNum = "";
            if(_conf.authType == 1) {
              //            var startWait = false;
               fileName = _root.find("#cardNum option:selected").attr(
                  "filename");
               cardNum = _root.find("#cardNum option:selected").attr(
                  "cardnum");
            }else {
              fileName = _root.find("#cardNum").attr("fileName");
              cardNum = "record";
              let amount = parseInt($("#qrcodeList").attr("amount"));
              if(amount == 0){
                layer.msg("暂无数据可导出");
                return;
              }
            }
            if(fileName == undefined){
              layer.msg("批次里没有需要下载的文件");
              return;
            }
            var startWait = false;
            $.ajax({
              type: "post",
              url: PREPARE_EXCEL_URL,
              data: {
                appId: appId,
                recordId: recordId,
                fileName: fileName,
                partnerId: _conf.partnerId,
                authType: _conf.authType
              },
              dataType: "json",
              async: false,
              success: function (data) {
                if (data.code == 0) {
                  startWait = true;
                }
              },
              error: function (data) {
              }
            });
            if (startWait) {
              var int = setInterval(function () {

                if (_checkExcel(appId, fileName,()=>{
                  clearInterval(int);
                  window.open(
                      LEAD_OUT_EXCEL_URL + "?appId=" + appId
                      + "&fileName=" + fileName + "&partner=" + _conf.partnerName
                      + "&appName=" + _conf.appName + "&cardNum=" + cardNum
                      + "&amount=" + amount+"&authType="+_conf.authType);
                })) {
                  console.log("ok");
                }
              }, 1000);
            }

          },
          _checkExcel = function (appId, fileName,callBack) {
            $.ajax({
              type: "post",
              url: CHECK_EXCEL_URL,
              data: {appId: appId, fileName: fileName},
              dataType: "json",
              async: false,
              success: function (data) {
                if (data.code == 0) {
                  //检测到文件可以下载
                  if(callBack!= null){
                    callBack();
                  }
                  return true;
                } else if (data.code == 1) {
                  //未检测到文件
                  return false;
                }
              },
              error: function (data) {
                return false;
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